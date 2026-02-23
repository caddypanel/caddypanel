import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { Box, Card, Flex, Heading, Text, TextField, Button, Callout } from '@radix-ui/themes'
import { Zap, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../stores/auth.js'
import 'altcha'

// ============ Login Page ============
export default function Login() {
    const navigate = useNavigate()
    const { needSetup, loading, login, setup } = useAuthStore()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [altchaPayload, setAltchaPayload] = useState('')
    const altchaRef = useRef(null)

    useEffect(() => {
        const widget = altchaRef.current
        if (!widget) return

        const handleStateChange = (e) => {
            if (e.detail?.state === 'verified') {
                setAltchaPayload(e.detail.payload || '')
            } else {
                setAltchaPayload('')
            }
        }

        widget.addEventListener('statechange', handleStateChange)
        return () => widget.removeEventListener('statechange', handleStateChange)
    }, [needSetup, loading])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSubmitting(true)

        try {
            if (needSetup) {
                await setup(username, password)
            } else {
                if (!altchaPayload) {
                    setError('请先完成安全验证')
                    setSubmitting(false)
                    return
                }
                await login(username, password, altchaPayload)
            }
            navigate('/', { replace: true })
        } catch (err) {
            const msg = err.response?.data?.error || 'Connection failed'
            setError(msg)
            // Reset altcha widget on error
            setAltchaPayload('')
            if (altchaRef.current) {
                altchaRef.current.reset?.()
            }
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <Flex align="center" justify="center" style={{ minHeight: '100vh' }}>
                <Text size="3" color="gray">Loading...</Text>
            </Flex>
        )
    }

    return (
        <Flex
            align="center"
            justify="center"
            style={{
                minHeight: '100vh',
                background: 'var(--cp-bg)',
            }}
        >
            <Box style={{ width: '100%', maxWidth: 400, padding: '0 16px' }}>
                {/* Logo */}
                <Flex direction="column" align="center" gap="2" mb="6">
                    <Flex
                        align="center"
                        justify="center"
                        style={{
                            width: 56,
                            height: 56,
                            borderRadius: 16,
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.25)',
                        }}
                    >
                        <Zap size={28} color="white" />
                    </Flex>
                    <Heading size="6" weight="bold" style={{ color: 'var(--cp-text)' }}>
                        CaddyPanel
                    </Heading>
                    <Text size="2" color="gray">
                        Reverse Proxy Management
                    </Text>
                </Flex>

                {/* Login Card */}
                <Card
                    size="3"
                    style={{
                        background: 'var(--cp-card)',
                        border: '1px solid var(--cp-border)',
                        boxShadow: 'var(--cp-shadow-lg)',
                    }}
                >
                    <form onSubmit={handleSubmit}>
                        <Flex direction="column" gap="4">
                            <Heading size="4" align="center">
                                {needSetup ? 'Create Admin Account' : 'Sign In'}
                            </Heading>

                            {needSetup && (
                                <Callout.Root color="blue" size="1">
                                    <Callout.Icon>
                                        <AlertCircle size={16} />
                                    </Callout.Icon>
                                    <Callout.Text>
                                        First time setup — create your admin account.
                                    </Callout.Text>
                                </Callout.Root>
                            )}

                            {error && (
                                <Callout.Root color="red" size="1">
                                    <Callout.Icon>
                                        <AlertCircle size={16} />
                                    </Callout.Icon>
                                    <Callout.Text>{error}</Callout.Text>
                                </Callout.Root>
                            )}

                            <Flex direction="column" gap="1">
                                <Text as="label" size="2" weight="medium" htmlFor="username">
                                    Username
                                </Text>
                                <TextField.Root
                                    id="username"
                                    placeholder="admin"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    autoFocus
                                    size="3"
                                />
                            </Flex>

                            <Flex direction="column" gap="1">
                                <Text as="label" size="2" weight="medium" htmlFor="password">
                                    Password
                                </Text>
                                <TextField.Root
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    size="3"
                                />
                            </Flex>

                            {/* ALTCHA PoW verification (not shown during initial setup) */}
                            {!needSetup && (
                                <Flex direction="column" gap="1">
                                    <Text size="1" color="gray">安全验证</Text>
                                    <altcha-widget
                                        ref={altchaRef}
                                        challengeurl="/api/auth/altcha-challenge"
                                        hidefooter
                                        hidelogo
                                    />
                                </Flex>
                            )}

                            <Button
                                type="submit"
                                size="3"
                                disabled={submitting || !username || !password || (!needSetup && !altchaPayload)}
                                style={{ cursor: 'pointer' }}
                            >
                                {submitting
                                    ? 'Please wait...'
                                    : needSetup
                                        ? 'Create Account'
                                        : 'Sign In'}
                            </Button>
                        </Flex>
                    </form>
                </Card>

                <Text size="1" color="gray" align="center" mt="4" as="p">
                    CaddyPanel — Powered by Caddy Server
                </Text>
            </Box>
        </Flex>
    )
}
