'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const EXPERTS = [
	{
		name: 'Pavan kona',
		experience: '4+ years experience',
		languages: 'English, Hindi, Telugu',
		tags: ['Intraday trading', 'Options buying', 'RSI & breakout scalping'],
		price: 'Rs 999 /-',
		priceClass: 'line-through text-gray-500',
		image: '/demo2.png',
		badge: {
			icon: '/verifiedpnlblue.svg',
			text: 'Verified PnL',
			textClass: 'text-blue-700',
			bgClass: 'bg-white',
		},
		buttonClass: 'bg-[#00C282] hover:bg-[#00A36D]',
		buttonText: 'Book your session',
		free: true,
		orufyLink: '/tradio/2n-event?BackgroundColor=FFFFFF&TextColor=363942&ButtonColor=098666',
	},
	{
		name: 'Palak jain',
		experience: '6+ years experience',
		languages: 'English, Hindi',
		tags: ['Intraday trading', 'Options buying', 'Swing trading & breakout scalping'],
		price: 'Rs 999 /-',
		priceClass: 'text-black',
		image: '/demo1.png',
		badge: {
			icon: '/verifiedpnlgreen.svg',
			text: 'SEBI RA',
			textClass: 'text-green-700',
			bgClass: 'bg-white',
		},
		buttonClass: 'bg-blue-600 hover:bg-blue-700',
		buttonText: 'Book your session',
		free: false,
		orufyLink: '/tradio/30-min-intro-call?BackgroundColor=FFFFFF&TextColor=363942&ButtonColor=098666',
	},
];

export default function Review() {
	const [showWidget, setShowWidget] = useState(false);
	const [selectedExpertIdx, setSelectedExpertIdx] = useState(null);

	useEffect(() => {
		if (!showWidget || selectedExpertIdx === null) return;
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = 'https://orufybookings.com/external/widget.css';
		link.type = 'text/css';
		link.media = 'all';
		document.head.appendChild(link);

		// Add Orufy JS
		const script = document.createElement('script');
		script.type = 'module';
		script.src = 'https://orufybookings.com/external/widget.js';
		script.onload = () => {
			if (window.orufyBookings && typeof window.orufyBookings.InLineWidget === 'function') {
				window.orufyBookings.InLineWidget();
			}
		};
		document.body.appendChild(script);

		// Cleanup
		return () => {
			if (document.head.contains(link)) document.head.removeChild(link);
			if (document.body.contains(script)) document.body.removeChild(script);
		};
	}, [showWidget, selectedExpertIdx]);

	return (
		<div className="h-full w-full flex flex-col items-center bg-white dark:bg-neutral-900">
			<div className="w-full max-w-4xl mt-8">
				<h1 className="text-3xl font-bold text-center mb-2">Level Up Your Trading</h1>
				<div className="flex justify-center gap-4 mb-8 text-lg">
					<span>🧑‍💼Real Experts</span>
					<span>🏅Real Strategies</span>
					<span>✅Real Growth</span>
				</div>
			</div>
			{!showWidget ? (
				<div className="flex flex-col md:flex-row items-center md:items-stretch gap-8 justify-center w-full max-w-5xl">
					{EXPERTS.map((expert, idx) => (
						<div
							key={idx}
							className="bg-white dark:bg-neutral-800 rounded-xl shadow border border-neutral-200 dark:border-neutral-700 flex flex-col items-center p-4 w-[320px] min-h-[420px] relative"
							style={{ boxShadow: '0 2px 8px 0 rgba(60,60,60,0.08)' }}
						>
							<div className="relative w-full h-48 mb-2">
								<Image
									src={expert.image}
									alt={expert.name}
									fill
									className="object-cover rounded-t-xl"
									style={{ objectFit: 'cover' }}
								/>
								<div className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded ${expert.badge.bgClass}`}>
									<Image
										src={expert.badge.icon}
										alt={expert.badge.text}
										width={18}
										height={18}
									/>
									<span className={`text-xs font-semibold ${expert.badge.textClass}`}>{expert.badge.text}</span>
								</div>
							</div>
							<div className="w-full flex flex-col items-start">
								<div className="font-semibold text-lg">{expert.name}</div>
								<div className="text-gray-500 text-sm mb-1">{expert.experience}</div>
								{expert.languages && (
									<div className="flex items-center text-gray-400 text-xs mb-2">
										<span className="mr-1">🌐</span>
										{expert.languages}
									</div>
								)}
								<div className="flex flex-wrap gap-2 mb-2">
									{expert.tags.map((tag, i) => (
										<span
											key={i}
											className="bg-yellow-100 text-gray-800 text-xs px-2 py-1 rounded"
										>
											{tag}
										</span>
									))}
								</div>
								<div className="flex items-center justify-between w-full mt-2 gap-2">
									<div className="flex items-center gap-2 flex-shrink-0">
										{expert.free && (
											<span className="font-bold text-base text-green-600">FREE</span>
										)}
										<span className={`font-semibold text-base dark:text-white ${expert.priceClass}`}>{expert.price}</span>
									</div>
									<Button
										className={cn(`${expert.buttonClass} text-white text-base font-semibold rounded px-3 cursor-pointer`)}
										onClick={() => {
											if (expert.orufyLink) {
												setSelectedExpertIdx(idx);
												setShowWidget(true);
											}
										}}
									>
									
										{expert.buttonText}
									</Button>
								</div>
							</div>
						</div>
					))}
				</div>
			) : (
				<div
					style={{ height: '100dvh' }}
					className="orufy-bookings-inline-widget w-full"
					data-access-link={EXPERTS[selectedExpertIdx]?.orufyLink}
				></div>
			)}
			<div className="w-full flex justify-center mt-12">
				<span className="text-gray-400 text-2xl font-medium">More experts will be onboarded soon</span>
			</div>
		</div>
	);
}