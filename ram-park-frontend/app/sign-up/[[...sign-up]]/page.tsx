import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>
        Create your RamPark account
      </h1>
      <p style={{ marginBottom: 16 }}>
        Only <b>@farmingdale.edu</b> email addresses are allowed.
      </p>
      <SignUp />
    </div>
  );
}