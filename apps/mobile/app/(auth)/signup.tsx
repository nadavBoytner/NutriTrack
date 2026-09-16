import { Link, type Href } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { Button } from "@/components/Button";
import { Field, Input } from "@/components/Field";
import { GlassPanel } from "@/components/GlassPanel";
import { Screen } from "@/components/Screen";
import { ApiError, apiFetch } from "@/lib/api";
import { authStyles } from "@/lib/auth-styles";
import { useAuth } from "@/lib/auth-context";

export default function SignupScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<{ accessToken: string }>("/auth/signup", {
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
      <View style={{ marginTop: 48 }}>
        <GlassPanel contentStyle={{ padding: 24 }}>
          <View style={authStyles.header}>
            <Text style={authStyles.wordmark}>NutriTrack</Text>
            <Text style={authStyles.subtitle}>פתיחת יומן תזונה חדש</Text>
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
          <Field label="סיסמה (לפחות 8 תווים)">
            <Input value={password} onChangeText={setPassword} secureTextEntry textAlign="left" />
          </Field>

          {error && <Text style={authStyles.error}>{error}</Text>}

          <Button label="הרשמה" onPress={handleSubmit} loading={loading} />

          <View style={authStyles.footer}>
            <Text style={authStyles.footerText}>כבר יש לך חשבון? </Text>
            <Link href={"/(auth)" as Href} style={authStyles.link}>
              להתחברות
            </Link>
          </View>
        </GlassPanel>
      </View>
    </Screen>
  );
}
