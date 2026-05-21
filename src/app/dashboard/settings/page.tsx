"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  Phone,
  Info,
  ExternalLink,
} from "lucide-react";
import { PROVIDERS, type ProviderType } from "@/lib/ai/providers";

interface AISettings {
  provider: string;
  api_key: string;
  base_url: string | null;
  model: string;
  system_prompt: string;
  context_window_days: number;
}

interface WhatsAppSettings {
  phone_number_id: string;
  access_token: string;
  webhook_verify_token: string;
  connected: boolean;
  access_token_masked: string;
}

function TestMessageSection() {
  const [testPhone, setTestPhone] = useState("");
  const [testContent, setTestContent] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  async function handleTest() {
    if (!testPhone || !testContent) return;
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/webhook/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: testPhone, content: testContent }),
      });

      const data = await res.json();

      if (!res.ok) {
        setTestResult(`Error: ${data.error}`);
        return;
      }

      setTestResult(`Success! AI Reply: ${data.ai_reply}`);
    } catch {
      setTestResult("Failed to send test message");
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Test Phone Number
        </label>
        <input
          type="text"
          value={testPhone}
          onChange={(e) => setTestPhone(e.target.value)}
          placeholder="e.g., +1234567890"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Test Message
        </label>
        <input
          type="text"
          value={testContent}
          onChange={(e) => setTestContent(e.target.value)}
          placeholder="Hello"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
        />
      </div>
      <button
        onClick={handleTest}
        disabled={testing || !testPhone || !testContent}
        className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {testing ? "Testing..." : "Send Test Message"}
      </button>
      {testResult && (
        <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          {testResult}
        </p>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [whatsapp, setWhatsapp] = useState<WhatsAppSettings | null>(null);
  const [hasPassword, setHasPassword] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [showWhatsAppToken, setShowWhatsAppToken] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        console.log("Settings loaded:", data);
        setSettings(data.ai);
        setWhatsapp(data.whatsapp);
        setHasPassword(data.dashboard?.has_password);
        if (data.ai?.model) {
          setModels([data.ai.model]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load settings:", err);
        setLoading(false);
      });
  }, []);

  async function handleFetchModels() {
    if (!settings) return;
    setFetchingModels(true);
    setMessage(null);

    try {
      const res = await fetch("/api/ai/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: settings.provider,
          api_key: settings.api_key,
          base_url: settings.base_url || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error });
        return;
      }

      setModels(data.models.map((m: any) => m.id));
      setMessage({ type: "success", text: `Found ${data.models.length} models` });
    } catch {
      setMessage({ type: "error", text: "Failed to fetch models" });
    } finally {
      setFetchingModels(false);
    }
  }

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ai: settings }),
      });

      if (!res.ok) {
        setMessage({ type: "error", text: "Failed to save settings" });
        return;
      }

      setMessage({ type: "success", text: "Settings saved successfully" });
    } catch {
      setMessage({ type: "error", text: "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  }

  async function handleWhatsAppSave() {
    if (!whatsapp) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsapp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to save WhatsApp settings" });
        return;
      }

      setMessage({ type: "success", text: "WhatsApp settings saved successfully" });
      fetch("/api/settings")
        .then((r) => r.json())
        .then((d) => setWhatsapp(d.whatsapp));
    } catch (e) {
      setMessage({ type: "error", text: "Failed to save WhatsApp settings" });
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordSave() {
    if (!newPassword) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dashboard: { password: newPassword } }),
      });

      if (!res.ok) {
        setMessage({ type: "error", text: "Failed to update password" });
        return;
      }

      setNewPassword("");
      setHasPassword(true);
      setMessage({ type: "success", text: "Password updated" });
    } catch {
      setMessage({ type: "error", text: "Failed to update password" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

        {message && (
          <div
            className={`flex items-center gap-2 p-4 rounded-lg mb-6 ${
              message.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-600" />
            AI Configuration
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provider
              </label>
              <select
                value={settings?.provider || "openrouter"}
                onChange={(e) =>
                  setSettings((s) =>
                    s
                      ? {
                          ...s,
                          provider: e.target.value,
                          base_url: PROVIDERS[e.target.value as ProviderType]
                            ?.defaultBaseUrl,
                        }
                      : s
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {Object.entries(PROVIDERS).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={settings?.api_key || ""}
                  onChange={(e) =>
                    setSettings((s) =>
                      s ? { ...s, api_key: e.target.value } : s
                    )
                  }
                  placeholder="Enter your API key"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base URL
              </label>
              <input
                type="text"
                value={settings?.base_url || ""}
                onChange={(e) =>
                  setSettings((s) =>
                    s ? { ...s, base_url: e.target.value } : s
                  )
                }
                placeholder={
                  PROVIDERS[settings?.provider as ProviderType]?.defaultBaseUrl
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Model
                </label>
                <button
                  onClick={handleFetchModels}
                  disabled={fetchingModels || !settings?.api_key}
                  className="text-sm text-green-600 hover:text-green-700 disabled:opacity-50 flex items-center gap-1"
                >
                  {fetchingModels ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : null}
                  {fetchingModels ? "Fetching..." : "Fetch Models"}
                </button>
              </div>
              <select
                value={settings?.model || ""}
                onChange={(e) =>
                  setSettings((s) =>
                    s ? { ...s, model: e.target.value } : s
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {models.length > 0 ? (
                  models.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))
                ) : (
                  <option value={settings?.model || ""}>
                    {settings?.model || "No models loaded"}
                  </option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Context Memory (days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={settings?.context_window_days || 90}
                onChange={(e) =>
                  setSettings((s) =>
                    s
                      ? {
                          ...s,
                          context_window_days: parseInt(e.target.value) || 90,
                        }
                      : s
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                The AI will remember messages from the last{" "}
                {settings?.context_window_days || 90} days
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                System Prompt
              </label>
              <textarea
                value={settings?.system_prompt || ""}
                onChange={(e) =>
                  setSettings((s) =>
                    s ? { ...s, system_prompt: e.target.value } : s
                  )
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-green-600" />
            WhatsApp Configuration
          </h2>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">Setup Instructions</p>
                <ol className="list-decimal list-inside space-y-1.5">
                  <li>Go to <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="underline flex items-center gap-1 inline-flex">Meta for Developers <ExternalLink className="w-3 h-3" /></a> and create an app</li>
                  <li>Add the <strong>WhatsApp</strong> product to your app</li>
                  <li>Get your <strong>Phone Number ID</strong> from the WhatsApp API settings</li>
                  <li>Generate a <strong>Temporary Access Token</strong> (or create a System User for production)</li>
                  <li>Create a <strong>Webhook Verify Token</strong> (any secret string you choose)</li>
                  <li>Configure the webhook URL: <code className="bg-blue-100 px-1 py-0.5 rounded text-xs">{typeof window !== "undefined" ? window.location.origin : "YOUR_URL"}/api/webhook</code></li>
                  <li>Subscribe to the <strong>messages</strong> webhook field</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number ID
              </label>
              <input
                type="text"
                value={whatsapp?.phone_number_id || ""}
                onChange={(e) =>
                  setWhatsapp((w) =>
                    w ? { ...w, phone_number_id: e.target.value } : w
                  )
                }
                placeholder="e.g., 123456789012345"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Token
              </label>
              <div className="relative">
                <input
                  type={showWhatsAppToken ? "text" : "password"}
                  value={whatsapp?.access_token || ""}
                  onChange={(e) =>
                    setWhatsapp((w) =>
                      w ? { ...w, access_token: e.target.value } : w
                    )
                  }
                  placeholder="Enter your WhatsApp access token"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="button"
                  onClick={() => setShowWhatsAppToken(!showWhatsAppToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showWhatsAppToken ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {whatsapp?.access_token_masked && (
                <p className="text-xs text-gray-500 mt-1">
                  Current: {whatsapp.access_token_masked}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Webhook Verify Token
              </label>
              <input
                type="text"
                value={whatsapp?.webhook_verify_token || ""}
                onChange={(e) =>
                  setWhatsapp((w) =>
                    w ? { ...w, webhook_verify_token: e.target.value } : w
                  )
                }
                placeholder="Choose a secret verify token"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                This token is used to verify your webhook with Meta
              </p>
            </div>

            {whatsapp?.connected && (
              <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 p-3 rounded-lg">
                <CheckCircle className="w-4 h-4" />
                WhatsApp is connected
              </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Webhook URL</p>
              <code className="text-xs text-gray-600 break-all">
                {typeof window !== "undefined"
                  ? window.location.origin + "/api/webhook"
                  : "https://drdent2.vercel.app/api/webhook"}
              </code>
              <p className="text-xs text-gray-500 mt-2">
                Use this URL in Meta for Developers → WhatsApp → Configuration
              </p>
            </div>

            <button
              onClick={handleWhatsAppSave}
              disabled={saving}
              className="w-full bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Saving..." : "Save WhatsApp Settings"}
            </button>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Test Pipeline</p>
              <TestMessageSection />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Dashboard Password
          </h2>
          <div className="flex gap-3">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={hasPassword ? "New password" : "Set password"}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              minLength={4}
            />
            <button
              onClick={handlePasswordSave}
              disabled={saving || !newPassword}
              className="px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {hasPassword ? "Update" : "Set"}
            </button>
          </div>
          {hasPassword && (
            <p className="text-sm text-gray-500 mt-2">
              A password is currently set
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
