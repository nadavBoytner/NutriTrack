import { StyleSheet } from "react-native";
import { colors } from "@/lib/colors";
import { fonts } from "@/lib/fonts";

export const authStyles = StyleSheet.create({
  header: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingBottom: 20,
  },
  wordmark: {
    fontFamily: fonts.displayBold,
    fontSize: 30,
    color: colors.good,
    letterSpacing: -0.5,
    textAlign: "right",
  },
  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: "right",
    marginTop: 4,
    writingDirection: "rtl",
  },
  error: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.warn,
    marginBottom: 12,
    textAlign: "right",
  },
  footer: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkSoft,
  },
  link: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.link,
    textDecorationLine: "underline",
  },
});
