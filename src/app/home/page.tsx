import { Droplets, HeartPulse, User, Building } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Droplets className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Blood Bank Management</h1>
          </div>
          <nav className="space-x-4">
            <a href="/home" className="hover:underline">Home</a>
            <a href="/dashboard" className="hover:underline">Dashboard</a>
            <a href="/" className="hover:underline">Login</a>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <section className="bg-white py-20">
          <div className="container mx-auto text-center">
            <h2 className="text-5xl font-extrabold text-primary mb-4">
              Donate Blood, Save Lives
            </h2>
            <p className="text-accent-foreground text-lg max-w-2xl mx-auto mb-8">
              Welcome to the central portal for blood bank management. Your donation can make a world of difference.
            </p>
            <a
              href="/dashboard"
              className="bg-primary text-primary-foreground font-bold py-3 px-8 rounded-full hover:bg-red-700 transition duration-300"
            >
              Register as a Donor
            </a>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <HeartPulse className="h-16 w-16 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-2">Why Donate?</h3>
              <p className="text-accent-foreground">
                A single donation can save up to three lives. Be a hero in your community.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <User className="h-16 w-16 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-2">For Donors</h3>
              <p className="text-accent-foreground">
                Find nearby blood banks, schedule appointments, and track your donation history.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Building className="h-16 w-16 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-2">For Blood Banks</h3>
              <p className="text-accent-foreground">
                Manage your inventory, donor registrations, and camp schedules efficiently.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-100 text-accent-foreground p-4">
        <div className="container mx-auto text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Blood Bank Management System. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
