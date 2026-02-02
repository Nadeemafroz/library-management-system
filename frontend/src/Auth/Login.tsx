import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, Alert, Tabs, Tab } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // 👈 Adjust this path if needed

const Login: React.FC = () => {
  const { login } = useAuth(); // 👈 use context login
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/'); // Redirect if already logged in
    }
  }, [navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (activeTab === 'register') {
        if (password !== confirmPassword) {
          throw new Error("Passwords don't match");
        }

        // const response = await axios.post('/api/auth/register', {
        //   email,
        //   password
        // });

        setSuccess('Registration successful! Please login.');
        setActiveTab('login');
      } else {
        const response = await axios.post('/api/auth/login', {
          email,
          password
        });

        const token = response.data;
        login(token); // 👈 update context
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => {
                  setActiveTab(k as 'login' | 'register');
                  setError('');
                  setSuccess('');
                }}
                className="mb-3"
              >
                <Tab eventKey="login" title="Login">
                  <Form onSubmit={handleSubmit}>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Form.Group className="mb-3">
                      <Form.Label>Email address</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Button variant="primary" type="submit">
                      Login
                    </Button>
                  </Form>
                </Tab>

                <Tab eventKey="register" title="Register">
                  <Form onSubmit={handleSubmit}>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form.Group className="mb-3">
                      <Form.Label>Email address</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Confirm Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Button variant="primary" type="submit">
                      Register
                    </Button>
                  </Form>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
