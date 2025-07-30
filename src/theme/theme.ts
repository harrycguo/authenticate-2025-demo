import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#25cc7e",
      light: "#42a5f5",
      dark: "#17a2b8",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#dc004e",
      light: "#ff5983",
      dark: "#9a0036",
      contrastText: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
      variants: [
        {
          props: { color: "secondary", variant: "contained" },
          style: {
            backgroundColor: "#17a2b8",
            color: "#ffffff",
            "&:hover": {
              backgroundColor: "#138a9f",
            },
          },
        },
        {
          props: { color: "secondary", variant: "outlined" },
          style: {
            color: "#17a2b8",
            borderColor: "#17a2b8",
            "&:hover": {
              backgroundColor: "rgba(23, 162, 184, 0.08)",
              borderColor: "#138a9f",
              color: "#138a9f",
            },
          },
        },
      ],
    },
  },
});
