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
import { Checkbox } from '@/components/ui/checkbox';
import { Lock, Mail, User, CircleUser } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import GoogleSignIn from './googleSignin';
import { getSignup } from '@/lib/firebase/authActions';
import { useRouter } from 'next/navigation';

// Define validation schema
const signupSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[0-9]/, { message: "Password must contain at least one number" }),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine(val => val === true, {
        message: "You must accept the terms and conditions"
    })
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});

const SignupForm = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false
    });

    const router = useRouter()

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Handle checkbox change separately
    const handleCheckboxChange = (checked) => {
        setFormData(prev => ({
            ...prev,
            acceptTerms: checked
        }));

        if (errors.acceptTerms) {
            setErrors(prev => ({
                ...prev,
                acceptTerms: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Validate form data
            const validatedData = signupSchema.parse(formData);
            setErrors({});

            // Show loading state
            setIsLoading(true);

            await getSignup(validatedData.email, validatedData.password);

            // On success
            toast.success("Account created successfully", {
                description: "Redirecting to dashboard..."
            });

      

            router.push('/dashboard')

        } catch (error) {
            // Handle Zod validation errors
            if (error instanceof z.ZodError) {
                const formattedErrors = {};
                error.errors.forEach(err => {
                    // Handle nested paths like refine errors
                    const field = err.path[0];
                    formattedErrors[field] = err.message;
                });
                setErrors(formattedErrors);

                toast.error("Signup failed", {
                    description: "Please check the form for errors"
                });
            } else {
                // Handle other errors (e.g., network issues)
                toast.error("Signup error", {
                    description: "An unexpected error occurred. Please try again."
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center w-full h-full">
            <form className="w-full h-full" onSubmit={handleSubmit}>
                <Card className="rounded-none shadow-none border-none h-full  items-center justify-center flex flex-col">
                    <CardHeader className="space-y-1 w-full">
                        <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
                        <CardDescription className="text-center">
                            Enter your details to sign up for a new account
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
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
                                <Label htmlFor="password">Password</Label>
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
                                <p className="text-xs text-gray-500 mt-1">
                                    Password must be at least 8 characters with at least one uppercase letter and one number
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        className={`pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                </div>
                                {errors.confirmPassword && (
                                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                                )}
                            </div>

                            <div className="flex items-start space-x-2 pt-2">
                                <Checkbox
                                    id="acceptTerms"
                                    checked={formData.acceptTerms}
                                    onCheckedChange={handleCheckboxChange}
                                    className={errors.acceptTerms ? 'border-red-500' : ''}
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <label
                                        htmlFor="acceptTerms"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        I accept the terms and conditions
                                    </label>
                                    {errors.acceptTerms && (
                                        <p className="text-red-500 text-xs">{errors.acceptTerms}</p>
                                    )}
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                                onClick={() => trackEvent('clicked_on_signup')}
                            >
                                {isLoading ? 'Creating Account...' : 'Sign Up'}
                            </Button>

                            <div className="relative flex items-center py-2">
                                <div className="flex-grow border-t border-gray-300"></div>
                                <span className="flex-shrink mx-4 text-xs text-gray-500">OR</span>
                                <div className="flex-grow border-t border-gray-300"></div>
                            </div>

                            <GoogleSignIn />
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
};

export default SignupForm;