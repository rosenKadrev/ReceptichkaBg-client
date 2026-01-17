import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ArticleStore } from '../../../store/article.store';
import { TextInputComponent } from '../../auth/forms/text-input/text-input.component';
import { TextareaInputComponent } from '../../auth/forms/textarea-input/textarea-input.component';
import { Article, Paragraph } from '../../../store/models/data.models';

@Component({
    selector: 'app-add-article',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSelectModule,
        MatProgressSpinnerModule,
        TextInputComponent,
        TextareaInputComponent
    ],
    templateUrl: './add-article.component.html',
    styleUrl: './add-article.component.scss'
})
export class AddArticleComponent {
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    public articleStore = inject(ArticleStore);

    public articleForm!: FormGroup;
    public isEditMode = signal(false);
    public mainImagePreview: string | null = null;
    public mainImageFile: File | null = null;

    private articleId = signal<string | null>(this.route.snapshot.paramMap.get('id'));

    constructor() {
        this.initializeForm();

        const id = this.articleId();
        this.articleStore.getArticleCategories();

        if (id) {
            this.articleStore.getArticleById(id);
            this.isEditMode.set(true);
        } else {
            this.isEditMode.set(false);
        }

        effect(() => {
            const article = this.articleStore.selectedArticle();
            if (article) {
                this.patchFormWithArticle(article);
            }
        });
    }

    ngOnDestroy() {
        this.articleStore.clearSelectedArticle();
    }

    private initializeForm(): void {
        this.articleForm = this.fb.group({
            category: ['', Validators.required],
            name: ['', Validators.required],
            description: ['', Validators.required],
            paragraphs: this.fb.array([], Validators.required),
            imageUrl: ['', Validators.required],
        });
    }

    private patchFormWithArticle(article: Article): void {
        this.articleForm.patchValue({
            category: article.articleCategory.id,
            name: article.name,
            description: article.description
        });

        while (this.paragraphs.length > 0) {
            this.paragraphs.removeAt(0);
        }

        if (article.paragraphs) {

            article.paragraphs.forEach((p: Paragraph) => {
                const paragraphGroup = this.fb.group({
                    title: [p.title],
                    text: [p.description, Validators.required],
                    image: [null],
                    imagePreview: [p.imageUrl || null]
                });
                this.paragraphs.push(paragraphGroup);
            });
        }

        if (article.mainImageUrl) {
            this.mainImagePreview = article.mainImageUrl;
            this.articleForm.patchValue({
                imageUrl: article.mainImageUrl,
            });
        }
    }

    get paragraphs(): FormArray {
        return this.articleForm.get('paragraphs') as FormArray;
    }

    addParagraph(): void {
        const paragraphGroup = this.fb.group({
            title: [''],
            text: ['', Validators.required],
            image: [null],
            imagePreview: [null]
        });

        this.paragraphs.push(paragraphGroup);
    }

    removeParagraph(index: number): void {
        this.paragraphs.removeAt(index);
    }

    onParagraphImageSelected(event: Event, index: number): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            const paragraphControl = this.paragraphs.at(index);

            paragraphControl.patchValue({ image: file });

            const reader = new FileReader();
            reader.onload = (e) => {
                paragraphControl.patchValue({ imagePreview: e.target?.result as string });
            };
            reader.readAsDataURL(file);
        }
    }

    removeParagraphImage(index: number): void {
        const paragraphControl = this.paragraphs.at(index);
        paragraphControl.patchValue({
            image: null,
            imagePreview: null
        });

        const fileInputs = document.querySelectorAll('.paragraph-image-upload input[type="file"]');
        const fileInput = fileInputs[index] as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    }

    onMainImageSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            this.mainImageFile = input.files[0];
            this.articleForm.get('imageUrl')?.setValue(this.mainImageFile.name);

            const reader = new FileReader();
            reader.onload = (e) => {
                this.mainImagePreview = e.target?.result as string;
            };
            reader.readAsDataURL(this.mainImageFile);
        }
    }

    removeMainImage(): void {
        this.mainImageFile = null;
        this.mainImagePreview = null;
        this.articleForm.get('imageUrl')?.setValue('');

        const fileInput = document.querySelector('.main-image-upload input[type="file"]') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    }

    onSubmit(): void {
        // if (this.articleForm.invalid) {
        //     this.articleForm.markAllAsTouched();
        //     return;
        // }

        const formData = new FormData();
        const formValues = this.articleForm.value;

        Object.keys(formValues).forEach((key) => {
            const value = formValues[key];
            if (value !== null && value !== undefined && key !== 'imageUrl' && key !== 'paragraphs') {
                formData.append(key, value.toString());
            }
        });

        const paragraphsData = this.paragraphs.controls.map(paragraph => ({
            title: paragraph.value.title,
            text: paragraph.value.text,
            imageUrl: paragraph.value.imagePreview || null
        }));
        formData.append('paragraphs', JSON.stringify(paragraphsData));

        if (this.mainImageFile) {
            formData.append('image', this.mainImageFile);
        }

        this.paragraphs.controls.forEach((paragraph, index) => {
            const paragraphValue = paragraph.value;
            if (paragraphValue.image) {
                formData.append(`paragraphImages`, paragraphValue.image);
                formData.append(`paragraphImageIndexes`, index.toString());
            }
        });

        if (this.isEditMode()) {
            const id = this.articleId()!;
            this.articleStore.updateArticle({ id, articleData: formData });
        } else {
            this.articleStore.createArticle(formData);
        }
    }
}