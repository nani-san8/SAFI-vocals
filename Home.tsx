import { useTracks } from "@/hooks/use-tracks";
import { UploadModal } from "@/components/UploadModal";
import { TrackCard } from "@/components/TrackCard";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { DonationModal } from "@/components/DonationModal";
import { DisclaimerModal } from "@/components/DisclaimerModal";
import { SafiLogo } from "@/components/SafiLogo";
import { CookieConsent } from "@/components/CookieConsent";
import { useLanguage } from "@/hooks/use-language";
import { Loader2, Music4, Link as LinkIcon } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { data: tracks, isLoading, error } = useTracks();
  const { t, dir } = useLanguage();

  return (
    <div className="min-h-screen bg-background text-foreground bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" dir={dir}>
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <SafiLogo />
            <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {t("app_title")}
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
            <DonationModal />
            <LanguageSwitcher />
            <UploadModal />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Hero / Empty State */}
        {!isLoading && tracks && tracks.length === 0 && (
          <div className="text-center py-12 sm:py-20 px-4">
            <div className="inline-flex items-center justify-center w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-secondary mb-6 relative group">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-20 group-hover:opacity-40 duration-1000" />
              <Music4 className="w-8 sm:w-10 h-8 sm:h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 font-display">{t("isolate_vocals")}</h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8 text-base sm:text-lg">
              {t("upload_description")}
            </p>
            <UploadModal />
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 sm:py-32 text-muted-foreground">
            <Loader2 className="w-8 sm:w-10 h-8 sm:h-10 animate-spin mb-4 text-primary" />
            <p className="text-sm sm:text-base">{t("loading_library")}</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-6 rounded-xl text-center my-8">
            <p className="font-medium">{t("failed_to_load")}</p>
          </div>
        )}

        {/* Track List */}
        {!isLoading && tracks && tracks.length > 0 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <h2 className="text-lg sm:text-xl font-semibold">{t("your_library")}</h2>
              <span className="text-xs sm:text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                {tracks.length} {tracks.length === 1 ? t("track") : t("tracks")}
              </span>
            </div>
            
            <div className="grid gap-6">
              {tracks.map((track) => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 sm:py-10 mt-12 sm:mt-16 bg-card/30">
        <div className="max-w-6xl mx-auto px-4 space-y-6 sm:space-y-8">
          <div className="text-center text-xs sm:text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} {t("app_title")}. {t("app_subtitle")}</p>
          </div>
          
          {/* Footer Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <button className="text-xs sm:text-sm text-primary hover:text-accent transition-colors font-medium">
              {t("terms_of_use")}
            </button>
            <span className="text-muted-foreground/20">|</span>
            <Link href="/about" className="text-xs sm:text-sm text-primary hover:text-accent transition-colors font-medium">
              {t("about_us")}
            </Link>
            <span className="text-muted-foreground/20">|</span>
            <button className="text-xs sm:text-sm text-primary hover:text-accent transition-colors font-medium">
              {t("contact_us")}
            </button>
            <span className="text-muted-foreground/20">|</span>
            <DisclaimerModal />
          </div>
        </div>
      </footer>

      {/* Cookie Consent Banner */}
      <CookieConsent />
    </div>
  );
}
