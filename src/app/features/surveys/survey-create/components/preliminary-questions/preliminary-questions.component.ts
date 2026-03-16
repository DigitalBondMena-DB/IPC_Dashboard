import { Component, inject, signal, OnInit, effect, linkedSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormArray,
  FormsModule,
} from '@angular/forms';
import { SurveyService } from '../../../services/survey.service';
import { MessageService } from 'primeng/api';
import { LucideAngularModule, Plus, Trash2, FileText, X, Pencil } from 'lucide-angular';
import { EditorModule } from 'primeng/editor';
import { SelectModule } from 'primeng/select';
import { BInputComponent } from '@/shared/components/b-input/b-input.component';
import { BSelectComponent } from '@/shared/components/b-select/b-select.component';

@Component({
  selector: 'app-preliminary-questions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LucideAngularModule,
    EditorModule,
    SelectModule,
    BInputComponent,
    BSelectComponent,
  ],
  templateUrl: './preliminary-questions.component.html',
  styles: [
    `
      :host ::ng-deep .p-editor-container .p-editor-content .ql-editor {
        min-height: 150px;
      }
      :host ::ng-deep .p-editor-toolbar {
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
      }
      :host ::ng-deep .p-editor-content {
        border-bottom-left-radius: 8px;
        border-bottom-right-radius: 8px;
      }
    `,
  ],
})
export class PreliminaryQuestionsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly surveyService = inject(SurveyService);
  private readonly messageService = inject(MessageService);

  readonly fileTextIcon = FileText;
  readonly plusIcon = Plus;
  readonly trashIcon = Trash2;
  readonly xIcon = X;
  readonly editIcon = Pencil;

  id = signal<string | null>(
    this.route.snapshot.paramMap.get('id') ||
      this.route.parent?.snapshot.paramMap.get('id') ||
      null,
  );
  isSubmitting = signal(false);

  questionsList = signal<any[]>([]);
  editingIndex = signal<number | null>(null);

  questionForm!: FormGroup;

  questionTypes = [
    { label: 'Text', value: 'text' },
    { label: 'Number', value: 'number' },
    { label: 'Phone', value: 'phone' },
    { label: 'Link', value: 'link' },
    { label: 'Dropdown', value: 'dropdown' },
    { label: 'Image', value: 'image' },
    { label: 'Document', value: 'document' },
    { label: 'Video', value: 'video' },
    { label: 'Date', value: 'date' },
    { label: 'DateTime', value: 'datetime' },
    { label: 'True/False', value: 'true_false' },
    { label: 'Radio', value: 'radio' },
    { label: 'TextArea', value: 'textarea' },
    { label: 'File', value: 'file' },
    { label: 'Location', value: 'location' },
    { label: 'Decimal', value: 'decimal' },
    { label: 'EnumList', value: 'enumlist' },
  ];

  showOptions = linkedSignal(() => {
    const type = this.questionForm?.get('type')?.value;
    return ['dropdown', 'radio', 'enumlist'].includes(type);
  });
  // Resource for loading existing survey data
  surveyResource = this.id() ? this.surveyService.getSurveyById(this.id()!) : null;

  constructor() {
    this.initForm();

    effect(() => {
      const data = this.surveyResource?.value();
      if (data && data.preliminary_questions) {
        this.questionsList.set(data.preliminary_questions);
      }
    });
  }

  ngOnInit() {}

  private initForm() {
    this.questionForm = this.fb.group({
      text: ['', Validators.required],
      description: [''],
      hint: [''],
      type: ['text', Validators.required],
      options: this.fb.array([]),
    });

    // Listen to type changes to reset options
    this.questionForm.get('type')?.valueChanges.subscribe((type) => {
      this.optionsArray.clear();
      if (['dropdown', 'radio', 'enumlist'].includes(type)) {
        this.showOptions.set(true);
        this.addOption(); // Add initial option
      } else {
        this.showOptions.set(false);
      }
    });
  }

  get optionsArray() {
    return this.questionForm.get('options') as FormArray;
  }

  addOption() {
    this.optionsArray.push(this.fb.control('', Validators.required));
  }

  removeOption(index: number) {
    if (this.optionsArray.length > 1) {
      this.optionsArray.removeAt(index);
    }
  }

  isFieldInvalid(name: string) {
    const control = this.questionForm.get(name);
    return control ? control.invalid && control.touched : false;
  }

  addQuestionToList() {
    if (this.questionForm.valid) {
      const formValue = this.questionForm.value;
      const question: any = {
        text: formValue.text,
        type: formValue.type,
        hint: formValue.hint || null,
        description: formValue.description || null,
        meta_data: null,
      };

      if (this.showOptions()) {
        question.meta_data = {
          options: formValue.options.map((opt: string) => ({
            label: opt,
            value: opt.toLowerCase().replace(/\s+/g, '_'),
          })),
        };
      }

      if (this.editingIndex() !== null) {
        this.questionsList.update((list) => {
          const newList = [...list];
          newList[this.editingIndex()!] = question;
          return newList;
        });
        this.messageService.add({
          severity: 'info',
          summary: 'Updated',
          detail: 'Question updated successfully',
        });
      } else {
        this.questionsList.update((list) => [...list, question]);
      }

      // Reset form
      this.cancelEdit();
    } else {
      this.questionForm.markAllAsTouched();
    }
  }

  editQuestion(index: number) {
    const question = this.questionsList()[index];
    this.editingIndex.set(index);

    this.questionForm.patchValue({
      text: question.text,
      description: question.description || '',
      hint: question.hint || '',
      type: question.type,
    });

    this.optionsArray.clear();
    if (question.meta_data?.options) {
      question.meta_data.options.forEach((opt: any) => {
        this.optionsArray.push(this.fb.control(opt.label, Validators.required));
      });
    }

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.editingIndex.set(null);
    this.questionForm.patchValue({
      text: '',
      description: '',
      hint: '',
      type: 'text',
    });
    this.optionsArray.clear();
    this.questionForm.markAsPristine();
    this.questionForm.markAsUntouched();
  }

  removeQuestionFromList(index: number) {
    this.questionsList.update((list) => list.filter((_, i) => i !== index));
  }

  onCancel() {
    this.router.navigate(['/survey']);
  }

  onSkip() {
    const nextPath = this.id() ? `/survey/edit/${this.id()}/structure` : '/survey';
    this.router.navigate([nextPath]);
  }

  onSubmit() {
    this.questionForm.markAllAsTouched();
    if (this.questionForm.invalid) {
      return;
    }
    this.addQuestionToList();
    if (!this.id()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Survey ID not found',
      });
      return;
    }

    this.isSubmitting.set(true);
    const payload = {
      preliminary_questions: this.questionsList(),
    };

    this.surveyService.updateSurvey(this.id()!, payload).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Preliminary questions saved',
        });
        this.router.navigate(['/survey/edit', this.id()!, 'structure']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Failed to save',
        });
      },
    });
  }
}
