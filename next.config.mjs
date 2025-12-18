import createNextIntlPlugin from 'next-intl/plugin';

const bucketName = process.env.AWS_S3_BUCKET_NAME;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: `${bucketName}.s3.us-east-1.amazonaws.com`,
        pathname: "/**"
      }
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    }
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);