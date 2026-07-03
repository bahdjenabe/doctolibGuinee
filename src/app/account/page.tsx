"use client";

// ============================================================
// MON COMPTE — /account/page.tsx
// ============================================================
//
// Espace paramètres du patient :
//   - Informations personnelles (+ préférences de rappel)
//   - Sécurité (changement de mot de passe)
//   - Proches / bénéficiaires
// ============================================================

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { PatientProfile, Beneficiary } from "@/types/patient";
import {
  getPatientProfile,
  savePatientProfile,
  changePassword,
  listenBeneficiaries,
  addBeneficiary,
  removeBeneficiary,
} from "@/lib/account";

function AccountContent() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // Mot de passe
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null,
  );

  // Proches
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [newBen, setNewBen] = useState({ name: "", relation: "Enfant", birthDate: "" });
  const [addingBen, setAddingBen] = useState(false);

  // ── Chargement ──
  useEffect(() => {
    if (!user) return;
    getPatientProfile(user).then(setProfile);
    const unsub = listenBeneficiaries(user.uid, setBeneficiaries);
    return () => unsub();
  }, [user]);

  const setField = (field: keyof PatientProfile, value: any) =>
    setProfile((p) => (p ? { ...p, [field]: value } : p));

  const setPref = (key: "emailReminders" | "smsReminders", value: boolean) =>
    setProfile((p) =>
      p ? { ...p, preferences: { ...p.preferences, [key]: value } } : p,
    );

  // ── Sauvegarde profil ──
  const handleSaveProfile = async () => {
    if (!user || !profile) return;
    setSavingProfile(true);
    setProfileMsg("");
    try {
      await savePatientProfile(user, profile);
      setProfileMsg("Profil enregistré ✓");
      setTimeout(() => setProfileMsg(""), 2500);
    } catch (e) {
      console.error(e);
      setProfileMsg("Erreur lors de l'enregistrement.");
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Changement mot de passe ──
  const handleChangePassword = async () => {
    if (!user) return;
    setPwdMsg(null);
    if (pwd.next.length < 6) {
      setPwdMsg({ type: "err", text: "Le nouveau mot de passe doit faire au moins 6 caractères." });
      return;
    }
    if (pwd.next !== pwd.confirm) {
      setPwdMsg({ type: "err", text: "Les deux mots de passe ne correspondent pas." });
      return;
    }
    setPwdSaving(true);
    try {
      await changePassword(user, pwd.current, pwd.next);
      setPwd({ current: "", next: "", confirm: "" });
      setPwdMsg({ type: "ok", text: "Mot de passe mis à jour ✓" });
    } catch (e: any) {
      console.error(e);
      const code = e?.code || "";
      setPwdMsg({
        type: "err",
        text:
          code.includes("wrong-password") || code.includes("invalid-credential")
            ? "Mot de passe actuel incorrect."
            : "Impossible de changer le mot de passe. Réessayez.",
      });
    } finally {
      setPwdSaving(false);
    }
  };

  // ── Ajout proche ──
  const handleAddBeneficiary = async () => {
    if (!user || !newBen.name.trim()) return;
    setAddingBen(true);
    try {
      await addBeneficiary(user.uid, {
        name: newBen.name.trim(),
        relation: newBen.relation,
        birthDate: newBen.birthDate,
      });
      setNewBen({ name: "", relation: "Enfant", birthDate: "" });
    } catch (e) {
      console.error(e);
    } finally {
      setAddingBen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (!profile) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  const inputCls =
    "w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400";

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            ← Tableau de bord
          </button>
          <span className="font-bold text-blue-900">Mon compte</span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-red-500"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Avatar + identité */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-bold">
            {profile.name?.charAt(0).toUpperCase() || "P"}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {profile.name || "Mon profil"}
            </h1>
            <p className="text-sm text-gray-400">{profile.email}</p>
          </div>
        </div>

        {/* ── Informations personnelles ── */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            Informations personnelles
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">Nom complet</label>
              <input
                value={profile.name}
                onChange={(e) => setField("name", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Email</label>
              <input value={profile.email} disabled className={`${inputCls} bg-gray-50 text-gray-400`} />
            </div>
            <div>
              <label className="text-xs text-gray-500">Téléphone</label>
              <input
                value={profile.phone || ""}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="6XX XX XX XX"
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Date de naissance</label>
              <input
                type="date"
                value={profile.birthDate || ""}
                onChange={(e) => setField("birthDate", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Sexe</label>
              <select
                value={profile.gender || ""}
                onChange={(e) => setField("gender", e.target.value)}
                className={`${inputCls} bg-white`}
              >
                <option value="">Non précisé</option>
                <option value="F">Femme</option>
                <option value="M">Homme</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Ville</label>
              <input
                value={profile.city || ""}
                onChange={(e) => setField("city", e.target.value)}
                placeholder="Conakry"
                className={inputCls}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-gray-500">Adresse</label>
              <input
                value={profile.address || ""}
                onChange={(e) => setField("address", e.target.value)}
                placeholder="Quartier, rue…"
                className={inputCls}
              />
            </div>
          </div>

          {/* Préférences de rappel */}
          <div className="mt-5 pt-5 border-t border-gray-100 space-y-3">
            <p className="text-sm font-medium text-gray-700">
              Préférences de rappel
            </p>
            {[
              { key: "emailReminders", label: "Recevoir les rappels par email" },
              { key: "smsReminders", label: "Recevoir les rappels par SMS" },
            ].map((pref) => {
              const checked =
                !!profile.preferences?.[pref.key as "emailReminders"];
              return (
                <label
                  key={pref.key}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <span className="text-sm text-gray-600">{pref.label}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setPref(pref.key as "emailReminders", !checked)
                    }
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      checked ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                        checked ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </label>
              );
            })}
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="bg-blue-700 hover:bg-blue-800 disabled:bg-gray-300 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              {savingProfile ? "Enregistrement…" : "Enregistrer"}
            </button>
            {profileMsg && (
              <span className="text-sm text-green-600">{profileMsg}</span>
            )}
          </div>
        </section>

        {/* ── Sécurité ── */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            Sécurité — mot de passe
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <input
              type="password"
              value={pwd.current}
              onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
              placeholder="Mot de passe actuel"
              className={inputCls}
            />
            <input
              type="password"
              value={pwd.next}
              onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
              placeholder="Nouveau mot de passe"
              className={inputCls}
            />
            <input
              type="password"
              value={pwd.confirm}
              onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
              placeholder="Confirmer"
              className={inputCls}
            />
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleChangePassword}
              disabled={pwdSaving || !pwd.current || !pwd.next}
              className="bg-gray-900 hover:bg-black disabled:bg-gray-300 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              {pwdSaving ? "…" : "Changer le mot de passe"}
            </button>
            {pwdMsg && (
              <span
                className={`text-sm ${pwdMsg.type === "ok" ? "text-green-600" : "text-red-500"}`}
              >
                {pwdMsg.text}
              </span>
            )}
          </div>
        </section>

        {/* ── Proches ── */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Mes proches</h2>
          <p className="text-xs text-gray-400 mb-4">
            Gérez les personnes pour lesquelles vous prenez rendez-vous.
          </p>

          {beneficiaries.length > 0 && (
            <div className="space-y-2 mb-4">
              {beneficiaries.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center gap-3 border border-gray-100 rounded-xl p-3"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-sm font-bold">
                    {b.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{b.name}</p>
                    <p className="text-xs text-gray-400">
                      {b.relation}
                      {b.birthDate && ` · né(e) le ${b.birthDate}`}
                    </p>
                  </div>
                  <button
                    onClick={() => user && removeBeneficiary(user.uid, b.id)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Retirer
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="grid sm:grid-cols-3 gap-3">
            <input
              value={newBen.name}
              onChange={(e) => setNewBen({ ...newBen, name: e.target.value })}
              placeholder="Nom du proche"
              className={inputCls}
            />
            <select
              value={newBen.relation}
              onChange={(e) => setNewBen({ ...newBen, relation: e.target.value })}
              className={`${inputCls} bg-white`}
            >
              {["Enfant", "Conjoint(e)", "Parent", "Autre"].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={newBen.birthDate}
              onChange={(e) => setNewBen({ ...newBen, birthDate: e.target.value })}
              className={inputCls}
            />
          </div>
          <button
            onClick={handleAddBeneficiary}
            disabled={addingBen || !newBen.name.trim()}
            className="mt-3 text-sm font-medium text-blue-700 hover:text-blue-800 disabled:text-gray-300"
          >
            + Ajouter un proche
          </button>
        </section>
      </div>
    </main>
  );
}

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <AccountContent />
    </ProtectedRoute>
  );
}
