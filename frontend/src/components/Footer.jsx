export default function Footer() {
    return (
        <footer className="bg-black text-gray-400 p-6 text-center mt-auto border-t border-gray-900 text-sm">
            <p>&copy; {new Date().getFullYear()} AI Portfolio Generator. All rights reserved.</p>
        </footer>
    );
}
