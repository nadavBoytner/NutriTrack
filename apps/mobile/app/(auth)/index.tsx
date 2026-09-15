import { Link } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { Button } from "@/components/Button";
import { Field, Input } from "@/components/Field";
import { Screen } from "@/components/Screen";
import { ApiError, apiFetch } from "@/lib/api";
import { authStyles } from "@/lib/auth-styles";
import { useAuth } from "@/lib/auth-context";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<{ accessToken: string }>("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      await signIn(res.accessToken);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "אירעה שגיאה, נסו שוב");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={authStyles.header}>
        <Text style={authStyles.wordmark}>NutriTrack</Text>
        <Text style={authStyles.subtitle}>התחברות ליומן התזונה שלך</Text>
      </View>

      <Field label="אימייל">
        <Input
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          textAlign="left"
        />
      </Field>
      <Field label="סיסמה">
        <Input value={password} onChangeText={setPassword} secureTextEntry textAlign="left" />
      </Field>

      {error && <Text style={authStyles.error}>{error}</Text>}

      <Button label="התחברות" onPress={handleSubmit} loading={loading} />

      <View style={authStyles.footer}>
        <Text style={authStyles.footerText}>עוד אין לך חשבון? </Text>
        <Link href="/signup" style={authStyles.link}>
          להרשמה
        </Link>
      </View>
    </Screen>
  );
}
