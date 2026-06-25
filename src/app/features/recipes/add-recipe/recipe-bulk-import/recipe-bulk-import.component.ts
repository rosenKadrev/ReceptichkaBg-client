import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { catchError, firstValueFrom, of } from 'rxjs';
import { RecipeStore } from '../../../../store/recipe.store';
import { RecipeService } from '../../../../services/recipe.service';

@Component({
  selector: 'app-recipe-bulk-import',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  templateUrl: './recipe-bulk-import.component.html',
  styleUrls: ['./recipe-bulk-import.component.scss'],
})
export class RecipeBulkImportComponent {
  public recipeStore = inject(RecipeStore);
  private recipeService = inject(RecipeService);
  private router = inject(Router);

  public isImporting = signal<boolean>(false);
  public importProgress = signal<number>(0);
  public importTotal = signal<number>(0);
  public importErrors = signal<string[]>([]);

  downloadTemplate(): void {
    import('xlsx').then((XLSX) => {
      const lookups = this.recipeStore.lookups();
      const wb = XLSX.utils.book_new();

      const headers = [
        'Име', 'Описание', 'Категория', 'Тип обработка',
        'Степен на трудност', 'Време за подготовка (мин)', 'Време за готвене (мин)', 'Порции',
        'Съставки (продукт:количество:мерна,...)', 'Инструкции (стъпка1|стъпка2|...)'
      ];
      const example = [
        'Баница',
        'Класическа баница с яйца и сирене',
        lookups?.categories[0]?.name ?? 'Категория',
        lookups?.processingTypes[0]?.name ?? 'Тип обработка',
        lookups?.degreeOfDifficulty[0]?.name ?? 'Трудност',
        30, 45, 8,
        'брашно:500:г,яйца:3:бр,сирене:300:г',
        'Разточете корите|Наредете ги в тавата|Печете 40 мин на 180°'
      ];

      const ws = XLSX.utils.aoa_to_sheet([headers, example]);
      ws['!cols'] = headers.map((_, i) => ({ wch: i >= 8 ? 40 : 20 }));

      const hint = 'Въведете точното име от таб "Справка"';
      (['C1', 'D1', 'E1'] as const).forEach((addr) => {
        if (ws[addr]) ws[addr].c = [{ a: 'Система', t: hint }];
      });

      XLSX.utils.book_append_sheet(wb, ws, 'Рецепти');

      if (lookups) {
        const maxLen = Math.max(
          lookups.categories.length,
          lookups.processingTypes.length,
          lookups.degreeOfDifficulty.length
        );
        const refRows: any[][] = [
          ['Категории', '', 'Типове обработка', '', 'Трудност'],
          ...Array.from({ length: maxLen }, (_, i) => [
            lookups.categories[i]?.name ?? '',
            '',
            lookups.processingTypes[i]?.name ?? '',
            '',
            lookups.degreeOfDifficulty[i]?.name ?? '',
          ])
        ];
        const wsRef = XLSX.utils.aoa_to_sheet(refRows);
        wsRef['!cols'] = [{ wch: 25 }, { wch: 5 }, { wch: 25 }, { wch: 5 }, { wch: 25 }];
        XLSX.utils.book_append_sheet(wb, wsRef, 'Справка');
      }

      XLSX.writeFile(wb, 'шаблон-рецепти.xlsx');
    });
  }

  async onImportExcel(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const XLSX = await import('xlsx');
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(ws);

    if (rows.length === 0) return;

    const lookups = this.recipeStore.lookups();
    const errors: string[] = [];

    const seenNames = new Map<string, number>();
    rows.forEach((row, idx) => {
      const name = String(row['Име'] ?? '').trim().toLowerCase();
      if (name) {
        if (seenNames.has(name)) {
          errors.push(`Ред ${idx + 2}: "${row['Име']}" е дублирано на ред ${seenNames.get(name)! + 2}`);
        } else {
          seenNames.set(name, idx);
        }
      }
    });

    rows.forEach((row, idx) => {
      const rowName = row['Име'] ?? `(ред ${idx + 2})`;
      try {
        this.rowToFormData(row, lookups);
      } catch (err: any) {
        const msg = err?.error?.message ?? 'Грешка при валидация';
        errors.push(`Ред ${idx + 2} "${rowName}": ${msg}`);
      }
    });

    if (errors.length > 0) {
      this.importErrors.set(errors);
      this.importProgress.set(0);
      this.importTotal.set(0);
      (event.target as HTMLInputElement).value = '';
      return;
    }

    this.isImporting.set(true);
    this.importTotal.set(rows.length);
    this.importProgress.set(0);
    this.importErrors.set([]);

    for (const row of rows) {
      const rowName = row['Име'] ?? '(без Име)';
      try {
        const formData = this.rowToFormData(row, lookups);
        await firstValueFrom(
          this.recipeService.createRecipe(formData).pipe(
            catchError((err: any) => {
              const msg = err?.error?.message ?? 'Грешка при запис';
              errors.push(`"${rowName}": ${msg}`);
              return of(null);
            })
          )
        );
      } catch (err: any) {
        const msg = err?.error?.message ?? err?.message ?? 'Грешка при запис';
        errors.push(`"${rowName}": ${msg}`);
      }
      this.importProgress.update(p => p + 1);
    }

    this.importErrors.set(errors);
    this.isImporting.set(false);
    (event.target as HTMLInputElement).value = '';

    if (errors.length === 0) {
      setTimeout(() => this.router.navigate(['/recipes/my']), 2000);
    }
  }

  private rowToFormData(row: any, lookups: any): FormData {
    const categoryId = lookups?.categories.find((c: any) => c.name === row['Категория'])?.id;
    const processingTypeId = lookups?.processingTypes.find((c: any) => c.name === row['Тип обработка'])?.id;
    const difficultyId = lookups?.degreeOfDifficulty.find((c: any) => c.name === row['Степен на трудност'])?.id;

    const isPositiveNumber = (val: any) => val !== undefined && val !== null && val !== '' && !isNaN(Number(val)) && Number(val) > 0;

    const errors: string[] = [];
    if (!row['Име'])                                          errors.push('липсва Име');
    if (!row['Описание'])                                     errors.push('липсва описание');
    if (!categoryId)                                          errors.push(`непозната категория: "${row['Категория']}"`);
    if (!processingTypeId)                                    errors.push(`непознат тип обработка: "${row['Тип обработка']}"`);
    if (!difficultyId)                                        errors.push(`непозната трудност: "${row['Степен на трудност']}"`);
    if (!isPositiveNumber(row['Време за подготовка (мин)']))  errors.push('времето за подготовка трябва да е число > 0');
    if (!isPositiveNumber(row['Време за готвене (мин)']))     errors.push('времето за готвене трябва да е число > 0');
    if (!isPositiveNumber(row['Порции']))                     errors.push('порциите трябва да са число > 0');

    if (!row['Съставки (продукт:количество:мерна,...)']) {
      errors.push('липсват съставки');
    } else {
      const badIngredients = String(row['Съставки (продукт:количество:мерна,...)'])
        .split(',')
        .map((s, i) => ({ index: i + 1, parts: s.trim().split(':') }))
        .filter(({ parts }) => parts.length !== 3 || parts.some(p => !p.trim()));
      if (badIngredients.length > 0) {
        errors.push(`съставки ${badIngredients.map(x => `#${x.index}`).join(', ')} нямат правилен формат - продукт:количество:мерна ед.`);
      }
    }

    if (!row['Инструкции (стъпка1|стъпка2|...)'])            errors.push('липсват инструкции');

    if (errors.length > 0) {
      throw { error: { message: errors.join(', ') } };
    }

    const ingredients = String(row['Съставки (продукт:количество:мерна,...)']).split(',').map((ing: string) => {
      const [name, quantity, unit] = ing.trim().split(':');
      return { name: name.trim(), quantity: quantity?.trim(), unit: unit?.trim() };
    });

    const instructions = String(row['Инструкции (стъпка1|стъпка2|...)']).split('|').map((inst: string, idx: number) => ({
      instruction: inst.trim(),
      ord: idx + 1,
    }));

    const formData = new FormData();
    formData.append('name', row['Име']);
    formData.append('description', row['Описание']);
    formData.append('category', categoryId);
    formData.append('typeOfProcessing', processingTypeId);
    formData.append('degreeOfDifficulty', difficultyId);
    formData.append('prepTime', String(row['Време за подготовка (мин)']));
    formData.append('cookTime', String(row['Време за готвене (мин)']));
    formData.append('servings', String(row['Порции']));
    formData.append('ingredients', JSON.stringify(ingredients));
    formData.append('instructions', JSON.stringify(instructions));
    return formData;
  }
}
