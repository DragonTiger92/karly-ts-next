import Link from 'next/link';

function Logo() {
  return (
    <Link href='/'>
      <img src='/images/logo.svg' alt='로고' />
    </Link>
  );
}

export default Logo;
