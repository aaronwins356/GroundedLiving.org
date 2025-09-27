"use client";

import { useId, useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";

interface ContactFormState {
  name: string;
  email: string;
  message: string;
}

interface FieldError {
  name?: string;
  email?: string;
  message?: string;
  general?: string;
}

const initialState: ContactFormState = {
  name: "",
  email: "",
  message: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactForm() {
  const [formData, setFormData] = useState<ContactFormState>(initialState);
  const [errors, setErrors] = useState<FieldError>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState<string>("");
  const fieldsetId = useId();

  const isSubmitting = status === "submitting";

  const validate = useMemo(
    () =>
      (values: ContactFormState): FieldError => {
        const nextErrors: FieldError = {};

        if (!values.name.trim()) {
          nextErrors.name = "Please share your name.";
        }

        if (!values.email.trim()) {
          nextErrors.email = "An email address helps us respond.";
        } else if (!emailPattern.test(values.email.trim())) {
          nextErrors.email = "Enter a valid email address.";
        }

        if (!values.message.trim()) {
          nextErrors.message = "Let us know how we can help.";
        }

        return nextErrors;
      },
    [],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(formData);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatus("error");
      setFeedback("Please address the highlighted fields.");
      return;
    }

    try {
      setStatus("submitting");
      setFeedback("");

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { errors?: FieldError; message?: string } | null;
        if (data?.errors) {
          setErrors(data.errors);
        }
        setStatus("error");
        setFeedback(data?.message ?? "We couldn\u2019t send your message. Please try again in a moment.");
        return;
      }

      setStatus("success");
      setFeedback("Thanks for reaching out. We\u2019ll respond soon.");
      setFormData(initialState);
      setErrors({});
    } catch (error) {
      console.error("Contact form submission failed", error);
      setStatus("error");
      setFeedback("We couldn\u2019t send your message. Please try again in a moment.");
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, general: undefined }));
  }

  return (
    <form className="contact-form" noValidate onSubmit={handleSubmit} aria-describedby={`${fieldsetId}-feedback`}>
      <fieldset className="contact-form__fieldset" disabled={isSubmitting}>
        <legend className="contact-form__legend">Send a private note</legend>
        <div className="contact-form__grid">
          <div className="contact-form__field">
            <label htmlFor={`${fieldsetId}-name`}>Name</label>
            <input
              id={`${fieldsetId}-name`}
              name="name"
              type="text"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? `${fieldsetId}-name-error` : undefined}
              required
            />
            {errors.name ? (
              <p id={`${fieldsetId}-name-error`} className="contact-form__error" role="alert">
                {errors.name}
              </p>
            ) : null}
          </div>
          <div className="contact-form__field">
            <label htmlFor={`${fieldsetId}-email`}>Email</label>
            <input
              id={`${fieldsetId}-email`}
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? `${fieldsetId}-email-error` : undefined}
              required
            />
            {errors.email ? (
              <p id={`${fieldsetId}-email-error`} className="contact-form__error" role="alert">
                {errors.email}
              </p>
            ) : null}
          </div>
        </div>
        <div className="contact-form__field">
          <label htmlFor={`${fieldsetId}-message`}>How can we help?</label>
          <textarea
            id={`${fieldsetId}-message`}
            name="message"
            rows={6}
            value={formData.message}
            onChange={handleChange}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? `${fieldsetId}-message-error` : undefined}
            required
          />
          {errors.message ? (
            <p id={`${fieldsetId}-message-error`} className="contact-form__error" role="alert">
              {errors.message}
            </p>
          ) : null}
        </div>
        <Button type="submit" className="contact-form__submit" loading={isSubmitting} disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send message"}
        </Button>
      </fieldset>
      <div
        className="contact-form__feedback"
        id={`${fieldsetId}-feedback`}
        aria-live="polite"
        role="status"
        data-status={status}
      >
        {feedback}
      </div>
    </form>
  );
}
