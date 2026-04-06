import { SignUpModal } from './SignUpModal';

const SignUpPage = () => {
  return (
    <div className="min-h-screen pt-24 px-4">
      <div className="max-w-md mx-auto bg-[#95ff00] rounded-lg p-6">
        <SignUpModal />
      </div>
    </div>
  );
};

export default SignUpPage;