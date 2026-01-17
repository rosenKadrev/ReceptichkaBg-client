import { Component, effect, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TextInputComponent } from '../../auth/forms/text-input/text-input.component';
import { TextareaInputComponent } from '../../auth/forms/textarea-input/textarea-input.component';
import { RecipeStore } from '../../../store/recipe.store';
import { MatSpinner } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';
import { Recipe } from '../../../store/models/data.models';

@Component({
  selector: 'app-add-recipe',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule,
    TextInputComponent,
    TextareaInputComponent,
    MatSpinner,
  ],
  templateUrl: './add-recipe.component.html',
  styleUrls: ['./add-recipe.component.scss'],
})
export class AddRecipeComponent implements OnInit {
  public recipeStore = inject(RecipeStore);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  public recipeForm: FormGroup = new FormGroup({});
  public imagePreview: string | null = null;
  private selectedFile: File | null = null;
  public isEditMode = signal<boolean>(false);
  readonly recipeId = input<string>(this.route.snapshot.paramMap.get('id') || '');

  constructor() {
    const id = this.recipeId();
    this.recipeStore.loadLookups();
    if (id) {
      this.recipeStore.loadRecipeDetails({ id, segment: 'my' });
      this.isEditMode.set(true);
    } else {
      this.isEditMode.set(false);
    }
    effect(() => {
      const recipe = this.recipeStore.selectedRecipe();
      if (recipe) {
        this.patchFormWithRecipe(recipe);
      }
    });
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy() {
    this.recipeStore.clearSelectedRecipe();
  }

  public initializeForm(): void {
    this.recipeForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      ingredients: this.fb.array([this.createIngredient()], Validators.required),
      instructions: this.fb.array([this.createInstruction('', 1)], Validators.required),
      category: ['', Validators.required],
      typeOfProcessing: ['', Validators.required],
      degreeOfDifficulty: ['', Validators.required],
      imageUrl: ['', Validators.required],
      prepTime: [null, [Validators.required, Validators.min(1)]],
      cookTime: [null, [Validators.required, Validators.min(1)]],
      servings: [null, [Validators.required, Validators.min(1)]],
    });
  }

  private patchFormWithRecipe(recipe: Recipe): void {
    while (this.ingredients.length) this.ingredients.removeAt(0);
    while (this.instructions.length) this.instructions.removeAt(0);

    const categoryId =
      this.recipeStore.lookups()?.categories.find((type) => type.name === recipe.category)?.id ||
      '';
    const processingTypeId =
      this.recipeStore
        .lookups()
        ?.processingTypes.find((type) => type.name === recipe.typeOfProcessing)?.id || '';
    const difficultyId =
      this.recipeStore
        .lookups()
        ?.degreeOfDifficulty.find((dif) => dif.name === recipe.degreeOfDifficulty)?.id || '';

    this.recipeForm.patchValue({
      name: recipe.name,
      description: recipe.description,
      category: categoryId,
      typeOfProcessing: processingTypeId,
      degreeOfDifficulty: difficultyId,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      servings: recipe.servings,
    });

    recipe.ingredients.forEach((ingredient: any) => {
      this.ingredients.push(this.createIngredient(ingredient));
    });

    recipe.instructions.forEach((instruction: any) => {
      this.instructions.push(this.createInstruction(instruction, instruction.sortOrder));
    });

    if (recipe.images && recipe.images.length > 0) {
      this.imagePreview = recipe.images[0].imageUrl;
      this.recipeForm.patchValue({
        imageUrl: recipe.images[0].imageUrl,
      });
    }
  }

  createIngredient(ingredient: any = { name: '', quantity: null, unit: '' }): FormGroup {
    return this.fb.group({
      name: [ingredient.name || '', Validators.required],
      quantity: [ingredient.quantity || null, [Validators.required]],
      unit: [ingredient.unit || '', Validators.required],
    });
  }

  get ingredients(): FormArray {
    return this.recipeForm.get('ingredients') as FormArray;
  }

  addIngredient(): void {
    this.ingredients.push(this.createIngredient());
  }

  removeIngredient(index: number): void {
    this.ingredients.removeAt(index);
  }

  createInstruction(instruction: any, order: number): FormGroup {
    return this.fb.group({
      instruction: [instruction.description || '', Validators.required],
      ord: [instruction.sortOrder || order, Validators.required],
    });
  }

  get instructions(): FormArray {
    return this.recipeForm.get('instructions') as FormArray;
  }

  addInstruction(): void {
    const newOrder = this.instructions.length + 1;
    this.instructions.push(this.createInstruction('', newOrder));
  }

  removeInstruction(index: number): void {
    this.instructions.removeAt(index);
    this.instructions.controls.forEach((control, index) => {
      control.get('ord')?.setValue(index + 1);
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.recipeForm.get('imageUrl')?.setValue(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.imagePreview = null;
    this.selectedFile = null;
    this.recipeForm.get('imageUrl')?.setValue('');
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onSubmit(): void {
    if (this.recipeForm.invalid) {
      return;
    }

    const formData = new FormData();
    const formValues = this.recipeForm.value;

    Object.keys(formValues).forEach((key) => {
      const value = formValues[key];
      if (value !== null && value !== undefined && key !== 'imageUrl') {
        if (key === 'ingredients' || key === 'instructions') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    if (this.isEditMode()) {
      this.recipeStore.updateRecipe({ id: this.recipeId(), recipeData: formData });
    } else {
      this.recipeStore.addRecipe(formData);
    }

  }
}
