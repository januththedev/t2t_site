import { createTheme } from "@mui/material/styles";
export const theme = createTheme({
  palette: {
    primary: { main: "#2855db" },
    text: { primary: "#172338", secondary: "#596578" },
    background: { default: "#f7f8fb", paper: "#fff" },
  },
  typography: {
    fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { padding: "12px 20px", borderRadius: 10 } },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
  },
});
