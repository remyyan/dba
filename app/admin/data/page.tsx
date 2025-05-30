"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { migrateDataToFirebase, checkFirebaseData, clearFirebaseData } from "@/lib/dataMigration";

export default function AdminDataPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [migrationStatus, setMigrationStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [firebaseData, setFirebaseData] = useState<any>(null);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/login');
    }
  }, [user, isAdmin, loading, router]);

  useEffect(() => {
    if (user && isAdmin) {
      checkData();
    }
  }, [user, isAdmin]);

  const checkData = async () => {
    try {
      const data = await checkFirebaseData();
      setFirebaseData(data);
    } catch (error) {
      console.error('Error checking data:', error);
    }
  };

  const handleMigration = async () => {
    setIsLoading(true);
    setMigrationStatus('Starting migration...');
    
    try {
      const result = await migrateDataToFirebase();
      setMigrationStatus(result.message);
      
      if (result.success) {
        // Refresh data check
        await checkData();
      }
    } catch (error) {
      setMigrationStatus(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm('Are you sure you want to clear ALL Firebase data? This cannot be undone!')) {
      return;
    }

    setIsLoading(true);
    setMigrationStatus('Clearing data...');
    
    try {
      const result = await clearFirebaseData();
      setMigrationStatus(result.message);
      
      if (result.success) {
        await checkData();
      }
    } catch (error) {
      setMigrationStatus(`Clear failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-3xl font-bold text-white hover:text-orange-400 transition-colors">
                <span className="text-orange-400">DBA</span> Admin
              </Link>
              <span className="text-gray-300 text-sm">Data Management</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin"
                className="text-white hover:text-orange-400 transition-colors"
              >
                ← Back to Admin
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Page Title */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-4 text-center">Data Management</h1>
          <p className="text-xl text-gray-300 text-center mb-8">
            Migrate your DBA league data to Firebase for persistent storage
          </p>
        </div>
      </section>

      {/* Current Data Status */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Firebase Data Status</h2>
            
            {firebaseData ? (
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{firebaseData.players}</p>
                  <p className="text-gray-300">Players in Firebase</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{firebaseData.teams}</p>
                  <p className="text-gray-300">Teams in Firebase</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{firebaseData.games}</p>
                  <p className="text-gray-300">Games in Firebase</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-300">Loading data status...</p>
            )}

            <div className="mt-6 p-4 rounded-lg bg-white/5">
              <p className="text-white font-semibold mb-2">Status:</p>
              <p className={`${firebaseData?.hasData ? 'text-green-400' : 'text-yellow-400'}`}>
                {firebaseData?.hasData ? '✅ Data exists in Firebase' : '⚠️ No data in Firebase - Migration needed'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Migration Actions */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Migration Actions</h2>
            
            <div className="space-y-6">
              {/* Migrate Data */}
              <div className="p-4 bg-green-600/20 rounded-lg border border-green-600/30">
                <h3 className="text-lg font-bold text-white mb-2">Migrate Data to Firebase</h3>
                <p className="text-gray-300 mb-4">
                  This will copy all your current DBA league data (players, teams, games) to Firebase for persistent storage.
                  This is safe to run and won't overwrite existing data.
                </p>
                <button
                  onClick={handleMigration}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  {isLoading ? 'Migrating...' : 'Migrate Data to Firebase'}
                </button>
              </div>

              {/* Clear Data */}
              <div className="p-4 bg-red-600/20 rounded-lg border border-red-600/30">
                <h3 className="text-lg font-bold text-white mb-2">Clear Firebase Data</h3>
                <p className="text-gray-300 mb-4">
                  ⚠️ <strong>DANGER:</strong> This will permanently delete ALL data from Firebase. 
                  Only use this if you need to start fresh or fix migration issues.
                </p>
                <button
                  onClick={handleClearData}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  {isLoading ? 'Clearing...' : 'Clear All Firebase Data'}
                </button>
              </div>

              {/* Refresh Status */}
              <div className="p-4 bg-blue-600/20 rounded-lg border border-blue-600/30">
                <h3 className="text-lg font-bold text-white mb-2">Refresh Data Status</h3>
                <p className="text-gray-300 mb-4">
                  Check the current status of data in Firebase.
                </p>
                <button
                  onClick={checkData}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Refresh Status
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Migration Status */}
      {migrationStatus && (
        <section className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Migration Status</h2>
              <div className="p-4 bg-white/5 rounded-lg">
                <p className="text-white font-mono text-sm whitespace-pre-wrap">{migrationStatus}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Instructions */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Instructions</h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-white font-semibold mb-2">1. First Time Setup:</h3>
                <p>Click "Migrate Data to Firebase" to copy all your current league data to the database.</p>
              </div>
              
              <div>
                <h3 className="text-white font-semibold mb-2">2. Making Yourself Admin:</h3>
                <p>Edit the file <code className="bg-black/30 px-2 py-1 rounded">contexts/AuthContext.tsx</code> and add your email to the adminEmails array.</p>
              </div>
              
              <div>
                <h3 className="text-white font-semibold mb-2">3. After Migration:</h3>
                <p>Once data is migrated, you can use the admin panel to add new players, games, and manage everything through the web interface.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-white/10 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">© 2024 Denlow Basketball Association. Admin Panel.</p>
        </div>
      </footer>
    </div>
  );
}
