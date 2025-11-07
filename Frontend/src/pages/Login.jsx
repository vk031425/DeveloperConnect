const Login = () => {
  return (
    <div className="page">
      <h2>Login Page</h2>
      <form className="form">
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
