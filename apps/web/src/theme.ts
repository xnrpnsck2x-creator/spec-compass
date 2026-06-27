import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    insight: Palette["primary"];
    codeAccent: string;
    localeAccent: string;
  }
  interface PaletteOptions {
    insight?: PaletteOptions["primary"];
    codeAccent?: string;
    localeAccent?: string;
  }
}

export const theme = createTheme({
  palette: {
    primary: {
      main: "#1A73E8",
      dark: "#185ABC",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#5F6368",
    },
    success: {
      main: "#188038",
    },
    warning: {
      main: "#F9AB00",
    },
    error: {
      main: "#D93025",
    },
    background: {
      default: "#F8FAFD",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#202124",
      secondary: "#5F6368",
    },
    insight: {
      main: "#9334E6",
      contrastText: "#FFFFFF",
    },
    codeAccent: "#3178C6",
    localeAccent: "#0B57D0",
  },
  typography: {
    fontFamily: "'Inter', 'Outfit', sans-serif",
    h1: {
      fontFamily: "'Outfit', sans-serif",
      fontWeight: 600,
    },
    h2: {
      fontFamily: "'Outfit', sans-serif",
      fontWeight: 600,
    },
    h3: {
      fontFamily: "'Outfit', sans-serif",
      fontWeight: 500,
    },
    h4: {
      fontFamily: "'Outfit', sans-serif",
      fontWeight: 500,
    },
    h5: {
      fontFamily: "'Outfit', sans-serif",
      fontWeight: 500,
    },
    h6: {
      fontFamily: "'Outfit', sans-serif",
      fontWeight: 500,
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "html, body, #root": {
          width: "100%",
          minHeight: "100%",
          overflowX: "hidden",
        },
        "*": {
          boxSizing: "border-box",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: "1px solid #DADCE0",
          boxShadow: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});
