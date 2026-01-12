interface Theme {
  colors: {
    primary: string;
    secondary: string;
    primaryDark: string;
    dark: string;
    darkLight: string;
    gray: string;
    text: string;
    textLight: string;
    textDark: string;
    rose: string;
    roseLight: string;
    disabled: string;
    background: string;
    success: string;
  };
  fonts: {
    medium: string;
    semibold: string;
    bold: string;
    extraBold: string;
  };
  radius: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    full: number;
  };
}
export const theme: Theme = {
  colors: {
    primary: "#fe8e00",
    secondary: "#f8c471",
    primaryDark: "#b9770e",
    dark: "#3E3E3E",
    darkLight: "#E1E1E1",
    gray: "#e3e3e3",
    text: "#494949",
    textLight: "#7C7C7C",
    textDark: "#1D1D1D",
    rose: "#ef4444",
    roseLight: "#f87171",
    disabled: "#000",
    background: "#EFF3FB",
    success: "#2ecc71",
  },
  fonts: {
    medium: "500",
    semibold: "600",
    bold: "700",
    extraBold: "800",
  },
  radius: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
    full: 100,
  },
};
