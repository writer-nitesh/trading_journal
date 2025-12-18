'use client'
import { useState } from 'react';
import { z } from 'zod';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Lock, Mail, CircleUser } from 'lucide-react';
import Link from 'next/link';
import { getLogin } from '@/lib/firebase/authActions';
import GoogleSignIn from './googleSignin';
import { useRouter } from 'next/navigation';

// Define validation schema
const loginSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" })
});

const LoginForm = () => {

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter()

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Validate form data
            const validatedData = loginSchema.parse(formData);
            setErrors({});

            // Show loading state
            setIsLoading(true);

            await getLogin(formData.email, formData.password)


            // On success
            toast.success("Login successful", {
                description: "Redirecting to dashboard..."
            });

            router.push('/dashboard')


            // Here you would normally redirect or update app state
            console.log("Form submitted with:", validatedData);

        } catch (error) {
            // Handle Zod validation errors
            if (error instanceof z.ZodError) {
                const formattedErrors = {};
                error.errors.forEach(err => {
                    const field = err.path[0];
                    formattedErrors[field] = err.message;
                });
                setErrors(formattedErrors);

                toast.error("Login failed", {
                    description: "Please check the form for errors"
                });
            } else {
                // Handle other errors (e.g., network issues)
                toast.error("Login error", {
                    description: "Invalid Credentials"
                });
            }
            console.log("error", error);

        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center bg-red-300 w-full h-full">
            <form className="w-full h-full flex justify-center items-center" onSubmit={handleSubmit}>

                <Card className="bg-none border-none rounded-none w-full h-full  flex justify-center items-center px-32">

                    <CardHeader className="space-y-1 w-full">
                        <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
                        <CardDescription className="text-center">
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="w-full">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                                    <Input
                                        id="email"
                                        placeholder="name@example.com"
                                        type="email"
                                        className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                                        Forgot password?
                                    </a>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>
                                {errors.password && (
                                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                                )}
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >

                                {isLoading ? 'Logging in...' : 'Login'}
                            </Button>
                            <div className="relative flex items-center py-2">
                                <div className="flex-grow border-t border-gray-300"></div>
                                <span className="flex-shrink mx-4 text-xs text-gray-500">OR</span>
                                <div className="flex-grow border-t border-gray-300"></div>
                            </div>

                            <GoogleSignIn />

                        </div>
                    </CardContent>
                    <CardFooter>
                        <p className="text-center text-sm text-neutral-600 mt-2 w-full">
                            Don't have an account?{' '}
                            <Link href="/signup" className="text-blue-600 hover:text-blue-800 font-medium">
                                Sign up
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </form>


        </div>
    );
};

export default LoginForm;