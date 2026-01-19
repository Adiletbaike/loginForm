import { useState } from "react";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { authTextFieldSx } from "../components/form/TextFieldStyles";

const LoginPage = () => {
  const navigate = useNavigate();

  // 1️⃣ State'ler
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // 2️⃣ Sahte kullanıcı (mock data)
  const fakeUser = {
    email: "test@test.com",
    password: "1234",
  };

  // 3️⃣ Form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (email === fakeUser.email && password === fakeUser.password) {
      localStorage.setItem("isLoggedIn", "true");
      setSuccess(true);

      setTimeout(() => {
        navigate("/home");
      }, 1000);
    } else {
      setError("Email or password is wrong");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(20px)",
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Login
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={authTextFieldSx}
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={authTextFieldSx}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
          >
            Login
          </Button>
        </Box>
      </Box>

      {/* ERROR */}
      <Snackbar open={!!error} autoHideDuration={3000}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>

      {/* SUCCESS */}
      <Snackbar open={success} autoHideDuration={2000}>
        <Alert severity="success">Login successful</Alert>
      </Snackbar>
    </Container>
  );
};

export default LoginPage;
