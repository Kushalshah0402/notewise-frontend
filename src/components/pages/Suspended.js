import React from "react";

export default function Suspended() {
  return (
    <div style={{ textAlign: "center", padding: "4rem" }}>
      <h2>Account Suspended</h2>
      <p>
        Your account has been disabled due to repeated violations.
        <br />
        Please email <b>contact.notewise@gmail.com</b> if you believe this is a mistake
        or you wish to appeal.
      </p>
    </div>
  );
}
