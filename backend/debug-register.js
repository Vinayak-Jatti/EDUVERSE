import { registerUser } from "./src/modules/auth/auth.service.js";

async function debugRegister() {
  try {
    const result = await registerUser({
      firstName: "Vinayak",
      lastName: "Jatti",
      email: "vnkjatti@gmail.com",
      campus: "Eduverse HQ",
      password: "Password123!"
    });
    console.log("SUCCESS:", result);
    process.exit(0);
  } catch (err) {
    console.error("FAILED:");
    console.error("Message:", err.message);
    console.error("ErrorCode:", err.errorCode);
    console.error("Stack:", err.stack);
    process.exit(1);
  }
}

debugRegister();
