import { useLanguage } from "@/hooks/use-language";
import { Heart } from "lucide-react";

export default function About() {
  const { t, dir } = useLanguage();

  return (
    <div className="min-h-screen bg-background text-foreground bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" dir={dir}>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold font-display mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            {t("about")} {t("app_title")}
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("professional_vocal_separation")}
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-12 bg-card/50 rounded-2xl p-8 sm:p-10 border border-border/30">
          <h2 className="text-2xl sm:text-3xl font-bold font-display mb-4">{t("our_mission")}</h2>
          <p className="text-foreground/80 leading-relaxed text-base sm:text-lg mb-4">
            {t("app_title")} {t("is_an")} <span className="font-semibold text-primary">{t("student_led_project")}</span> {t("aiming_to_provide")}
          </p>
          <p className="text-foreground/80 leading-relaxed text-base sm:text-lg flex items-center gap-2">
            <Heart className="w-5 h-5 text-accent" />
            <span>{t("committed_to_supporting")}</span>
          </p>
        </section>

        {/* What is Safi Section */}
        <section className="mb-12 bg-card/50 rounded-2xl p-8 sm:p-10 border border-border/30">
          <h2 className="text-2xl sm:text-3xl font-bold font-display mb-6">{t("what_is")} {t("app_title")}?</h2>
          <p className="text-foreground/80 leading-relaxed text-base sm:text-lg mb-6">
            {t("app_title")} {t("is_an")} {t("advanced_ai_tool")}
          </p>
          
          <h3 className="text-xl sm:text-2xl font-semibold font-display mb-4">{t("key_features")}</h3>
          <ul className="space-y-3 text-foreground/80">
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>{t("multiple_formats")}</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>{t("video_support")}</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>{t("fast_accurate")}</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>{t("professional_quality")}</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>{t("clean_vocals_mode")}</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>{t("privacy_focused")}</span>
            </li>
          </ul>
        </section>

        {/* Why Safi Section */}
        <section className="bg-card/50 rounded-2xl p-8 sm:p-10 border border-border/30">
          <h2 className="text-2xl sm:text-3xl font-bold font-display mb-6">{t("why_choose")} {t("app_title")}?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg text-primary mb-3">{t("fast_efficient")}</h3>
              <p className="text-foreground/80 text-sm sm:text-base">{t("process_quickly")}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-primary mb-3">{t("accessible_feature")}</h3>
              <p className="text-foreground/80 text-sm sm:text-base">{t("built_for_everyone")}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-primary mb-3">{t("ethical_feature")}</h3>
              <p className="text-foreground/80 text-sm sm:text-base">{t("student_mission")}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-primary mb-3">{t("secure_feature")}</h3>
              <p className="text-foreground/80 text-sm sm:text-base">{t("files_private")}</p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <p className="text-foreground/70 text-sm sm:text-base">
            {t("made_with_heart")} <Heart className="inline w-4 h-4 text-accent" />
          </p>
        </div>
      </main>
    </div>
  );
}
