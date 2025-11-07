const Register = () => {
  return (
    <div className="page">
      <h2>Register Page</h2>
      <form className="form">
        <input type="text" placeholder="Name" required />
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Password" required />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
