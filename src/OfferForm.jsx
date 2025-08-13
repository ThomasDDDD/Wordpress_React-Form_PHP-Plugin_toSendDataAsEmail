import React, { useMemo, useState } from "react";

/**
 * React Offer Form
 * - Fully responsive (Tailwind CSS)
 * - Sends FormData (multipart) to a WordPress REST endpoint
 * - Matches WP plugin fields:
 *   - firstName, lastName, email
 *   - address[street], address[zip], address[city]
 *   - doorMats[n][length|width|shape|isSpecialShape|amount|price] + doorMats_n_logo (file)
 *
 * Props:
 *  - endpoint: string (WP REST URL). Default "/wp-json/custom/v1/send-offer" (same-origin)
 *  - pricePerSqm: number (€/m²)
 *  - specialShapeSurcharge: number (e.g. 0.2 for +20%)
 */
export default function OfferForm({
  endpoint = "/wp-json/custom/v1/send-offer",
  pricePerSqm = 55,
  specialShapeSurcharge = 0.2,
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState({ street: "", zip: "", city: "" });

  const [doorMats, setDoorMats] = useState([
    {
      length: "", // meters
      width: "", // meters
      shape: "Rechteck",
      isSpecialShape: false,
      amount: 1,
      price: 0, // computed
      logo: null, // File
    },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  // --- Helpers ---
  const toNumber = (v) => {
    const n = parseFloat(String(v).replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  };

  const calcMatPrice = (m) => {
    const length = toNumber(m.length);
    const width = toNumber(m.width);
    const amount = Math.max(1, parseInt(m.amount || 0, 10) || 1);
    const area = (length / 100) * (width / 100); // m²
    const base = area * pricePerSqm * amount;
    const factor = m.isSpecialShape ? 1 + specialShapeSurcharge : 1;
    const price = Math.max(0, base * factor);
    return { area, price };
  };

  const matsWithComputed = useMemo(() => {
    return doorMats.map((m) => ({ ...m, ...calcMatPrice(m) }));
  }, [doorMats, pricePerSqm, specialShapeSurcharge]);

  const total = useMemo(
    () => matsWithComputed.reduce((sum, m) => sum + m.price, 0),
    [matsWithComputed]
  );

  const updateMat = (idx, patch) => {
    setDoorMats((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, ...patch } : m))
    );
  };

  const addMat = () =>
    setDoorMats((prev) => [
      ...prev,
      {
        length: "",
        width: "",
        shape: "Rechteck",
        isSpecialShape: false,
        amount: 1,
        price: 0,
        logo: null,
      },
    ]);

  const removeMat = (idx) =>
    setDoorMats((prev) => prev.filter((_, i) => i !== idx));

  const validate = () => {
    if (!firstName.trim()) return "Bitte Vornamen eingeben.";
    if (!lastName.trim()) return "Bitte Nachnamen eingeben.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Bitte gültige E-Mail eingeben.";
    if (!address.street.trim() || !address.zip.trim() || !address.city.trim())
      return "Bitte vollständige Adresse eingeben.";
    for (let i = 0; i < doorMats.length; i++) {
      const m = doorMats[i];
      if (toNumber(m.length) <= 0 || toNumber(m.width) <= 0)
        return `Matte ${i + 1}: Länge/Breite > 0 angeben.`;
      if ((parseInt(m.amount, 10) || 0) < 1)
        return `Matte ${i + 1}: Menge muss mindestens 1 sein.`;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    const err = validate();
    if (err) {
      setStatus({ ok: false, msg: err });
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("email", email);
      formData.append("address[street]", address.street);
      formData.append("address[zip]", address.zip);
      formData.append("address[city]", address.city);

      matsWithComputed.forEach((m, index) => {
        formData.append(
          `doorMats[${index}][length]`,
          String(toNumber(m.length))
        );
        formData.append(`doorMats[${index}][width]`, String(toNumber(m.width)));
        formData.append(`doorMats[${index}][shape]`, m.shape);
        formData.append(
          `doorMats[${index}][isSpecialShape]`,
          String(!!m.isSpecialShape)
        );
        formData.append(
          `doorMats[${index}][amount]`,
          String(parseInt(m.amount, 10) || 1)
        );
        formData.append(
          `doorMats[${index}][price]`,
          String(m.price.toFixed(2))
        );
        if (m.logo instanceof File) {
          formData.append(`doorMats_${index}_logo`, m.logo, m.logo.name);
        }
      });

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(
          data?.message || `Fehler beim Senden (HTTP ${res.status})`
        );
      }
      setStatus({ ok: true, msg: "Anfrage erfolgreich gesendet!" });
      // Optional: Formular zurücksetzen
      // resetForm();
    } catch (e) {
      setStatus({ ok: false, msg: e.message || "Unbekannter Fehler" });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setAddress({ street: "", zip: "", city: "" });
    setDoorMats([
      {
        length: "",
        width: "",
        shape: "Rechteck",
        isSpecialShape: false,
        amount: 1,
        price: 0,
        logo: null,
      },
    ]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto m-1 p-4 sm:p-6 bg-white/80 backdrop-blur rounded-2xl shadow">
      <h1 className="text-2xl sm:text-3xl font-semibold">
        Angebotsanfrage – Fußmatten
      </h1>
      <p className="text-sm text-gray-600 mt-1">
        Alle Felder mit * sind Pflichtfelder.
      </p>

      {/* Status */}
      {status && (
        <div
          className={`mt-4 p-3 rounded-lg text-sm ${
            status.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {status.msg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-8">
        {/* Kundendaten */}
        <section>
          <h2 className="text-xl font-medium mb-3">Kundendaten</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Vorname *</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring"
                placeholder="Max"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Nachname *</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring"
                placeholder="Mustermann"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium">E-Mail *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring"
                placeholder="max@example.com"
              />
            </div>
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-6 gap-4">
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium">
                  Straße & Hausnr. *
                </label>
                <input
                  type="text"
                  value={address.street}
                  onChange={(e) =>
                    setAddress({ ...address, street: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring"
                  placeholder="Musterstraße 1"
                />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium">PLZ *</label>
                <input
                  type="text"
                  value={address.zip}
                  onChange={(e) =>
                    setAddress({ ...address, zip: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring"
                  placeholder="12345"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium">Stadt *</label>
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) =>
                    setAddress({ ...address, city: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring"
                  placeholder="Musterstadt"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Matten */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium mb-3">Fußmatten</h2>
            {/* <button
              type="button"
              onClick={addMat}
              className="inline-flex items-center rounded-xl bg-black text-white text-sm px-3 py-2 hover:opacity-90"
            >
              + Matte hinzufügen
            </button> */}
          </div>

          <div className="space-y-6">
            {matsWithComputed.map((m, idx) => (
              <div key={idx} className="rounded-2xl border p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-medium">Matte #{idx + 1}</h3>
                  {matsWithComputed.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMat(idx)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Entfernen
                    </button>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-6 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-sm font-medium">
                      Länge (cm) *
                    </label>
                    <input
                      inputMode="decimal"
                      value={m.length}
                      onChange={(e) =>
                        updateMat(idx, { length: e.target.value })
                      }
                      className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring"
                      placeholder="z.B. 20"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-sm font-medium">
                      Breite (cm) *
                    </label>
                    <input
                      inputMode="decimal"
                      value={m.width}
                      onChange={(e) =>
                        updateMat(idx, { width: e.target.value })
                      }
                      className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring"
                      placeholder="z.B. 30"
                    />
                  </div>

                  <div className="sm:col-span-1 ">
                    <label className="block text-sm font-medium">
                      Spezialform
                    </label>
                    <input
                      type="checkbox"
                      checked={!!m.isSpecialShape}
                      onChange={(e) =>
                        updateMat(idx, { isSpecialShape: e.target.checked })
                      }
                      className="mt-1 w-10 h-10 rounded  border px-3 py-2 focus:outline-none focus:ring"
                    />
                  </div>
                  {!m.isSpecialShape && <div className="sm:col-span-2"></div>}
                  {m.isSpecialShape && (
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium">Form</label>
                      <select
                        value={m.shape}
                        onChange={(e) =>
                          updateMat(idx, { shape: e.target.value })
                        }
                        className="mt-1 w-full rounded-xl border px-3 py-2 bg-white focus:outline-none focus:ring"
                      >
                        <option>Individuell</option>
                        <option>Rund</option>
                        <option>Halbkreis</option>
                        <option>Dreieck</option>
                        <option>Raute</option>
                        <option>Trapez</option>
                        <option>Oval</option>
                        <option>Sechseck</option>
                        <option>Achteck</option>
                      </select>
                    </div>
                  )}

                  <div className="sm:col-span-1">
                    <label className="block text-sm font-medium">Menge *</label>
                    <input
                      type="number"
                      min={1}
                      value={m.amount}
                      onChange={(e) =>
                        updateMat(idx, { amount: e.target.value })
                      }
                      className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium">
                      Logo (optional)
                    </label>
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={(e) =>
                        updateMat(idx, { logo: e.target.files?.[0] || null })
                      }
                      className="mt-1 block w-full text-sm"
                    />
                  </div>

                  <div className="sm:col-span-3 grid grid-cols-2 gap-3 text-sm bg-gray-50 rounded-xl p-3">
                    <div>
                      <div className="text-gray-500">Fläche</div>
                      <div className="font-medium">{m.area?.toFixed(2)} m²</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Preis</div>
                      <div className="font-medium">{m.price?.toFixed(2)} €</div>
                    </div>
                    <div className="col-span-2 text-gray-500">
                      <span className="text-xs">
                        Grundlage: {pricePerSqm} €/m²
                        {specialShapeSurcharge
                          ? `, Zuschlag Spezialform: ${(
                              specialShapeSurcharge * 100
                            ).toFixed(0)}%`
                          : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Summe + Submit */}
        <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-lg">
            <span className="text-gray-600">Gesamtsumme: </span>
            <span className="font-semibold">{total.toFixed(2)} €</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={addMat}
              className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
            >
              + weitere Matte hinzufügen
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center rounded-xl bg-black text-white px-5 py-2.5 text-sm hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Senden…" : "Anfrage senden"}
            </button>
          </div>
        </section>
      </form>

      {/* Footer hint */}
      <p className="mt-6 text-xs text-gray-500">
        Durch Absenden stimmen Sie der Verarbeitung Ihrer Daten zur
        Angebotserstellung zu.
      </p>
    </div>
  );
}
