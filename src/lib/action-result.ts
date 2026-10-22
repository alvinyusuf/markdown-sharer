export type FieldErrors = Record<string, string[] | undefined>;

export type ActionResult =
  | {
      ok: true;
      message?: string;
      documentId?: string;
      slug?: string;
    }
  | {
      ok: false;
      message: string;
      fieldErrors?: FieldErrors;
    };

export type AuthFormState =
  | {
      ok: false;
      message: string;
      fieldErrors?: FieldErrors;
    }
  | {
      ok: true;
      message: string;
    }
  | undefined;

export function fieldErrorsFromZod(error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}): FieldErrors {
  return error.flatten().fieldErrors;
}
