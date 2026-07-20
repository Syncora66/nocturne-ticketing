"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Toast from "@/components/Toast";

export default function CreateEventForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = "Le nom de l'événement est requis.";
    }

    if (!date) {
      errors.date = "La date est requise.";
    } else if (new Date(date).getTime() <= Date.now()) {
      errors.date = "La date doit être dans le futur.";
    }

    if (!location.trim()) {
      errors.location = "Le lieu est requis.";
    }

    if (maxCapacity.trim()) {
      const parsed = Number(maxCapacity);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        errors.maxCapacity = "La capacité doit être un nombre entier positif.";
      }
    }

    setFieldErrors(errors);
    return errors;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      const isEmpty = !name.trim() && !date && !location.trim();
      setToast(
        isEmpty
          ? "Le formulaire est vide. Merci de le remplir."
          : "Merci de corriger les champs en rouge."
      );
      return;
    }

    setSubmitting(true);

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        date: new Date(date).toISOString(),
        location: location.trim(),
        description: description.trim() || null,
        maxCapacity: maxCapacity.trim() ? Number(maxCapacity) : null,
      }),
    });

    if (!res.ok) {
      setSubmitting(false);
      setFormError("Impossible de créer l'événement. Réessaie.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex max-w-xl flex-col gap-5"
    >
      <div>
        <label htmlFor="name" className="text-sm text-nocturne-text">
          Nom de l&apos;événement
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-md border border-nocturne-gray-dark bg-nocturne-gray px-4 py-3 text-nocturne-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nocturne-cyan"
        />
        {fieldErrors.name && (
          <p className="mt-1 text-sm text-nocturne-rose">{fieldErrors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="date" className="text-sm text-nocturne-text">
          Date et heure
        </label>
        <input
          id="date"
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 w-full rounded-md border border-nocturne-gray-dark bg-nocturne-gray px-4 py-3 text-nocturne-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nocturne-cyan [color-scheme:dark]"
        />
        {fieldErrors.date && (
          <p className="mt-1 text-sm text-nocturne-rose">{fieldErrors.date}</p>
        )}
      </div>

      <div>
        <label htmlFor="location" className="text-sm text-nocturne-text">
          Lieu
        </label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Adresse ou nom du lieu"
          className="mt-1 w-full rounded-md border border-nocturne-gray-dark bg-nocturne-gray px-4 py-3 text-nocturne-white placeholder:text-nocturne-text/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nocturne-cyan"
        />
        {fieldErrors.location && (
          <p className="mt-1 text-sm text-nocturne-rose">
            {fieldErrors.location}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="text-sm text-nocturne-text">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Line-up, dress code, infos pratiques..."
          className="mt-1 w-full resize-none rounded-md border border-nocturne-gray-dark bg-nocturne-gray px-4 py-3 text-nocturne-white placeholder:text-nocturne-text/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nocturne-cyan"
        />
      </div>

      <div>
        <label htmlFor="maxCapacity" className="text-sm text-nocturne-text">
          Capacité max
        </label>
        <input
          id="maxCapacity"
          type="number"
          min={1}
          step={1}
          value={maxCapacity}
          onChange={(e) => setMaxCapacity(e.target.value)}
          placeholder="Laisser vide si illimité"
          className="mt-1 w-full rounded-md border border-nocturne-gray-dark bg-nocturne-gray px-4 py-3 text-nocturne-white placeholder:text-nocturne-text/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nocturne-cyan"
        />
        {fieldErrors.maxCapacity && (
          <p className="mt-1 text-sm text-nocturne-rose">
            {fieldErrors.maxCapacity}
          </p>
        )}
      </div>

      {formError && <p className="text-sm text-nocturne-rose">{formError}</p>}

      <div className="mt-2 flex items-center gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-nocturne-rose px-6 py-3 font-mono text-sm font-bold uppercase tracking-wide text-nocturne-white transition-colors duration-200 ease-out hover:bg-nocturne-cyan hover:text-nocturne-black disabled:opacity-50"
        >
          {submitting ? "Création..." : "Créer l'événement"}
        </button>
        <a
          href="/dashboard"
          className="text-sm text-nocturne-text hover:text-nocturne-white"
        >
          Annuler
        </a>
      </div>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </form>
  );
}
