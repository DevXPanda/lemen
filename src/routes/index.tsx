import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  categories,
  formatFollowers,
  influencers,
  mockBrands,
  type Influencer,
} from "@/data/influencers";
import { formatINR } from "@/lib/format";
import { useAuth } from "@/components/auth-provider";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import heroBanner from "@/assets/hero-banner.jpg";
import pravixoFlow from "@/assets/pravixo-flow.jpeg";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

function FeaturedProfileCard({
  inf,
  user,
  handleCardClick,
}: {
  inf: Influencer;
  user: { id: string; email: string } | null;
  handleCardClick: (id: string) => void;
}) {
  return (
    <Link
      key={inf.id}
      to={`/influencer/${inf.id}`}
      onClick={(e) => {
        if (!user) {
          e.preventDefault();
          handleCardClick(inf.id);
        }
      }}
      className="group flex flex-col h-full overflow-hidden rounded-3xl border border-border bg-card transition-all hover:shadow-elevated"
    >
      <div className="relative w-full aspect-[1361/450] overflow-hidden">
        <img
          src={inf.cover}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
        <Badge
  className="
    absolute right-2 top-2
    rounded-full border-0
    bg-white/90 text-black
    dark:bg-zinc-800/90 dark:text-white
    backdrop-blur
    px-2 py-0.5 sm:px-3 sm:py-1
    text-[10px] sm:text-xs
    transition-colors duration-300
    hover:bg-yellow-400 hover:text-black
    dark:hover:bg-yellow-400 dark:hover:text-black
  "
>
  {inf.category}
</Badge>
      </div>
      <div className="-mt-7 sm:-mt-10 px-3 pb-3 sm:px-5 sm:pb-5 flex-1 flex flex-col">
        <img
          src={inf.avatar}
          alt={inf.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="relative z-10 h-14 w-14 sm:h-20 sm:w-20 rounded-full border-4 border-card object-cover shadow-elevated bg-muted"
        />
        <div className="mt-2.5 sm:mt-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-display font-semibold text-xs sm:text-base truncate">
              {inf.name}
            </h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
              {inf.handle}
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-0.5 text-xs sm:text-sm font-medium text-amber">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
            {inf.rating}
          </span>
        </div>
        <div className="mt-auto pt-3">
          <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center justify-between border-t border-border pt-3 text-[10px] sm:text-sm gap-1">
            <span className="flex items-center gap-0.5 text-muted-foreground truncate">
              <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5" />{" "}
              {inf.location.split(",")[0]}
            </span>
            <span>
              <strong>{formatFollowers(inf.followers)}</strong>{" "}
              <span className="text-muted-foreground">followers</span>
            </span>
          </div>
          <div className="mt-1.5 sm:mt-2 flex items-center justify-between text-[10px] sm:text-sm">
            <span className="text-muted-foreground">From</span>
            <span className="font-display text-xs sm:text-lg font-bold text-gradient-sunset">
              {formatINR(inf.startingPrice)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// export function Landing() {
//   const navigate = useNavigate();
//   const { user, profile } = useAuth();
//   const [showAuthModal, setShowAuthModal] = useState(false);
//   const [pendingRedirectUrl, setPendingRedirectUrl] = useState("");

//   const handleCreatorCardClick = (creatorId: string) => {
//     setPendingRedirectUrl(`/influencer/${creatorId}`);
//     setShowAuthModal(true);
//   };
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");

// // 👇 Ye naya state add karna hai
// const [activeInfo, setActiveInfo] = useState<
//   "creator" | "brand" | null
// >(null);
export function Landing() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingRedirectUrl, setPendingRedirectUrl] = useState("");

  const handleCreatorCardClick = (creatorId: string) => {
    setPendingRedirectUrl(`/influencer/${creatorId}`);
    setShowAuthModal(true);
  };

  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Yahi add karna hai
  const [activeInfo, setActiveInfo] = useState<"creator" | "brand" | null>(
    null,
  );

  useEffect(() => {
    document.title = "Pravixo — Hire creators that move the needle";
  }, []);
  useEffect(() => {
    document.title = "Pravixo — Hire creators that move the needle";
  }, []);

  const liveCreators = useQuery(api.profiles.list, { role: "creator" });
  const liveBrands = useQuery(api.profiles.list, { role: "brand" });

  const featuredCreators = useMemo(() => {
    const creators = liveCreators || [];
    const live = creators.map(
      (p) =>
        ({
          id: p._id,
          name: p.fullName,
          handle: p.handle || `@${p.fullName.toLowerCase().replace(/\s/g, "")}`,
          category: p.category || "General",
          followers:
            (p.instagramFollowers || 0) +
            (p.facebookFollowers || 0) +
            (p.linkedinFollowers || 0) +
            (p.youtubeFollowers || 0) +
            (p.quoraFollowers || 0) +
            (p.twitterFollowers || 0),
          startingPrice: p.startingPrice || 0,
          location: p.location || "India",
          rating: (p as unknown as { rating?: number }).rating ?? 5.0,
          reviews:
            (p as unknown as { reviewsCount?: number }).reviewsCount ?? 0,
          available: true,
          avatar:
            p.avatarUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.fullName}`,
          cover:
            p.coverUrl ||
            `https://api.dicebear.com/7.x/shapes/svg?seed=${p.fullName}`,
          bio: p.bio || "",
          role: p.role,
        }) as Influencer,
    );

    const orderedLive = [...live].sort((a, b) => {
      if (profile?.role === "creator") {
        if (a.id === profile._id) return -1;
        if (b.id === profile._id) return 1;
      }
      return 0;
    });

    return [...orderedLive, ...influencers].slice(0, 3);
  }, [liveCreators, profile]);

  const featuredBrands = useMemo(() => {
    const brands = liveBrands || [];
    const live = brands.map(
      (p) =>
        ({
          id: p._id,
          name: p.fullName,
          handle: p.handle || `@${p.fullName.toLowerCase().replace(/\s/g, "")}`,
          category: p.category || "General",
          followers: 0,
          startingPrice: p.startingPrice || 0,
          location: p.location || "India",
          rating: (p as unknown as { rating?: number }).rating ?? 5.0,
          reviews:
            (p as unknown as { reviewsCount?: number }).reviewsCount ?? 0,
          available: true,
          avatar:
            p.avatarUrl ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${p.fullName}`,
          cover:
            p.coverUrl ||
            `https://api.dicebear.com/7.x/shapes/svg?seed=${p.fullName}`,
          bio: p.bio || "",
          role: p.role,
        }) as Influencer,
    );

    return [...live, ...mockBrands].slice(0, 3);
  }, [liveBrands]);

  const [creatorsApi, setCreatorsApi] = useState<CarouselApi>();
  const [brandsApi, setBrandsApi] = useState<CarouselApi>();

  const [creatorsHovered, setCreatorsHovered] = useState(false);
  const [brandsHovered, setBrandsHovered] = useState(false);

  const [creatorsIndex, setCreatorsIndex] = useState(0);
  const [brandsIndex, setBrandsIndex] = useState(0);

  const [creatorsSnaps, setCreatorsSnaps] = useState<number[]>([]);
  const [brandsSnaps, setBrandsSnaps] = useState<number[]>([]);

  // Autoplay for creators
  useEffect(() => {
    if (!creatorsApi || creatorsHovered) return;
    const interval = setInterval(() => {
      creatorsApi.scrollNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [creatorsApi, creatorsHovered]);

  // Autoplay for brands
  useEffect(() => {
    if (!brandsApi || brandsHovered) return;
    const interval = setInterval(() => {
      brandsApi.scrollNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [brandsApi, brandsHovered]);

  // Sync snaps and index for creators
  useEffect(() => {
    if (!creatorsApi) return;
    setCreatorsSnaps(creatorsApi.scrollSnapList());
    setCreatorsIndex(creatorsApi.selectedScrollSnap());
    creatorsApi.on("select", () => {
      setCreatorsIndex(creatorsApi.selectedScrollSnap());
    });
  }, [creatorsApi]);

  // Sync snaps and index for brands
  useEffect(() => {
    if (!brandsApi) return;
    setBrandsSnaps(brandsApi.scrollSnapList());
    setBrandsIndex(brandsApi.selectedScrollSnap());
    brandsApi.on("select", () => {
      setBrandsIndex(brandsApi.selectedScrollSnap());
    });
  }, [brandsApi]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/browse");
    }
  };

  return (
    <div className="overflow-hidden">
      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* background banner image */}
        <div className="absolute inset-0 -z-10">
          <img
            src={heroBanner}
            alt="Featured creators across fashion, fitness, tech, beauty, travel and food"
            className="h-full w-full object-cover scale-110 blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/75 to-background" />
          <div className="absolute inset-0 bg-background/40" />
        </div>
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 -left-32 h-96 w-96 rounded-full gradient-warm opacity-20 blur-3xl animate-blob" />
          <div
            className="absolute top-20 right-0 h-[28rem] w-[28rem] rounded-full gradient-pink opacity-20 blur-3xl animate-blob"
            style={{ animationDelay: "4s" }}
          />
        </div>

        <div
          className={`mx-auto max-w-7xl px-6 pt-28 sm:px-8 sm:pt-28 lg:px-8 ${user ? "pb-1" : "pb-1"}`}
        >
          {/* <div className="mx-auto max-w-3xl text-center"> */}
          <div className="mx-auto max-w-5xl text-center">
            {/* <Badge
              variant="secondary"
              className="rounded-full border border-border bg-card/80 px-4 py-1.5 backdrop-blur"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" />
              Over 50,000 vetted creators
            </Badge> */}
            {/* <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Find the right influencers
              <br />
              <span className="text-gradient-sunset">
                for your Brand in Minutes..
              </span>
            </h1> */}
            <h1 className="mt-6 text-center font-display font-bold leading-[1.05] tracking-tight">
              <span className="block text-[clamp(2rem,5vw,4.5rem)] text-foreground">
                Find the right influencers
              </span>

              <span className="block text-[clamp(2rem,5vw,4.5rem)] text-gradient-sunset">
                for your Brand in Minutes.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Discover vetted influencers across every niche. Launch campaigns
              in days, not weeks. Get measurable results.
            </p>

            <form
              onSubmit={handleSearch}
              className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-full border border-border bg-card/90 p-2 shadow-soft backdrop-blur focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20"
            >
              <Search className="ml-3 h-5 w-5 text-muted-foreground" />
              <input
                placeholder="Try 'fashion creator in Paris'"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <Button
                type="submit"
                size="sm"
                className="rounded-full gradient-sunset border-0 text-white shadow-glow"
              >
                Search <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </form>

            {!user && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link to="/register?role=brand">
                  <Button
                    size="lg"
                    className="min-w-[220px] justify-center rounded-full gradient-sunset border-0 text-white shadow-glow transition-transform hover:scale-105 hover:opacity-95"
                  >
                    I'm a brand
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/register?role=creator">
                  <Button
                    size="lg"
                    className="rounded-full gradient-sunset border-0 text-white shadow-glow transition-transform hover:scale-105 hover:opacity-95"
                  >
                    I'm an influencer
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}

            {/* <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
              {["Fashion", "Tech", "Beauty", "Gaming"].map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-border bg-card/80 px-3 py-1 backdrop-blur"
                >
                  {c}
                </span>
              ))}
            </div> */}
          </div>

          {/* hero floating cards */}
          {/* <div className="relative mt-16 hidden w-full md:block">
            <div className="grid grid-cols-3 gap-6">
              {featured.slice(0, 3).map((inf, i) => (
                <div
                  key={inf.id}
                  className="animate-float cursor-pointer rounded-3xl border border-border bg-card p-4 transition-all duration-500 hover:-translate-y-3 hover:scale-105 hover:border-primary/40 hover:shadow-elevated"
                  style={{
                    animationDelay: `${i * 1.2}s`,
                    transform: i === 1 ? "translateY(-24px)" : "",
                  }}
                >
                  <img
                    src={inf.avatar}
                    alt={inf.name}
                    className="mb-3 h-14 w-14 rounded-2xl object-cover"
                  />
                  <p className="font-display text-sm font-semibold">
                    {inf.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {inf.category} · {formatFollowers(inf.followers)}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="font-semibold">
                      {formatINR(inf.startingPrice)}
                    </span>
                    <span className="flex items-center gap-1 text-amber">
                      <Star className="h-3 w-3 fill-current" />
                      {inf.rating}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div> */}
        </div>
      </section>

      {/* STATS */}
      {/* <section className="border-y border-border bg-muted/30">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { icon: Users, label: "Active creators", value: "52K+" },
            { icon: TrendingUp, label: "Campaigns run", value: "184K" },
            { icon: Zap, label: "Avg. launch time", value: "3.2 days" },
            { icon: CheckCircle2, label: "Success rate", value: "96%" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="font-display text-3xl font-bold">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section> */}
      <div className="mb-8 flex flex-wrap justify-center gap-3">
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() =>
            navigate("/protection-info", {
              state: { type: "creator" },
            })
          }
        >
          How do I get paid? (Creators)
        </Button>

        <Button
          variant="outline"
          className="rounded-full"
          onClick={() =>
            navigate("/protection-info", {
              state: { type: "brand" },
            })
          }
        >
          How is my money protected? (Brands)
        </Button>
      </div>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Browse by category
            </h2>
            <p className="mt-2 text-muted-foreground">
              Find the perfect voice for your brand.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.name}
              to="/browse"
              className="group rounded-3xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-none"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-2xl transition-transform group-hover:scale-110">
                {c.emoji}
              </div>
              <h3 className="font-display font-semibold">{c.name}</h3>
              {/* <p className="mt-1 text-xs text-muted-foreground">
                {c.count} creators
              </p> */}
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED CREATORS */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Featured creators
            </h2>
            <p className="mt-2 text-muted-foreground">
              Hand-picked by our team this week.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/browse?role=creator"
              className="hidden text-sm font-medium text-primary hover:underline sm:block"
            >
              View all →
            </Link>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-border bg-card hover:bg-accent"
                onClick={() => creatorsApi?.scrollPrev()}
                disabled={!creatorsApi?.canScrollPrev()}
                aria-label="Previous slide"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-border bg-card hover:bg-accent"
                onClick={() => creatorsApi?.scrollNext()}
                disabled={!creatorsApi?.canScrollNext()}
                aria-label="Next slide"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div
          onMouseEnter={() => setCreatorsHovered(true)}
          onMouseLeave={() => setCreatorsHovered(false)}
        >
          <Carousel
            setApi={setCreatorsApi}
            opts={{ loop: true, align: "start" }}
            className="w-full"
          >
            <CarouselContent className="items-stretch -ml-3 sm:-ml-6">
              {featuredCreators.map((inf) => (
                <CarouselItem
                  key={inf.id}
                  className="pl-3 sm:pl-6 basis-full md:basis-1/2 lg:basis-1/3"
                >
                  <FeaturedProfileCard
                    inf={inf}
                    user={user}
                    handleCardClick={handleCreatorCardClick}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {creatorsSnaps.length > 1 && (
          <div className="mt-6 flex justify-center gap-1.5">
            {creatorsSnaps.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === creatorsIndex
                    ? "bg-primary w-5"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50 w-1.5",
                )}
                onClick={() => creatorsApi?.scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* FEATURED BRANDS */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Featured brands
            </h2>
            <p className="mt-2 text-muted-foreground">
              Vetted brands hiring creators today.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/browse?role=brand"
              className="hidden text-sm font-medium text-primary hover:underline sm:block"
            >
              View all →
            </Link>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-border bg-card hover:bg-accent"
                onClick={() => brandsApi?.scrollPrev()}
                disabled={!brandsApi?.canScrollPrev()}
                aria-label="Previous slide"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-border bg-card hover:bg-accent"
                onClick={() => brandsApi?.scrollNext()}
                disabled={!brandsApi?.canScrollNext()}
                aria-label="Next slide"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div
          onMouseEnter={() => setBrandsHovered(true)}
          onMouseLeave={() => setBrandsHovered(false)}
        >
          <Carousel
            setApi={setBrandsApi}
            opts={{ loop: true, align: "start" }}
            className="w-full"
          >
            <CarouselContent className="items-stretch -ml-3 sm:-ml-6">
              {featuredBrands.map((inf) => (
                <CarouselItem
                  key={inf.id}
                  className="pl-3 sm:pl-6 basis-full md:basis-1/2 lg:basis-1/3"
                >
                  <FeaturedProfileCard
                    inf={inf}
                    user={user}
                    handleCardClick={handleCreatorCardClick}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {brandsSnaps.length > 1 && (
          <div className="mt-6 flex justify-center gap-1.5">
            {brandsSnaps.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === brandsIndex
                    ? "bg-primary w-5"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50 w-1.5",
                )}
                onClick={() => brandsApi?.scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </section>
      {/* PRAVIXO FLOW */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            How Pravixo Works
          </h2>

          <p className="mt-2 text-muted-foreground">
            Secure. Transparent. Trusted.
          </p>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-elevated">
          <img
            src={pravixoFlow}
            alt="Pravixo Flow"
            className="w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] gradient-sunset p-10 text-center text-white shadow-glow sm:p-16">
          <div
            className="absolute inset-0 opacity-30 mix-blend-overlay"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, white, transparent 40%), radial-gradient(circle at 80% 60%, white, transparent 40%)",
            }}
          />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold sm:text-5xl">
              Ready to launch your next campaign?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/80">
              Join 12,000+ brands using Pravixo to grow with creators.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {!user && (
                <Link to="/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20"
                  >
                    Start free
                  </Button>
                </Link>
              )}
              <Link to="/browse">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20"
                >
                  Explore creators
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { icon: Users, label: "Active creators", value: "52K+" },
            { icon: TrendingUp, label: "Campaigns run", value: "184K" },
            { icon: Zap, label: "Avg. launch time", value: "3.2 days" },
            { icon: CheckCircle2, label: "Success rate", value: "96%" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="font-display text-3xl font-bold">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowAuthModal(false)}
          />
          <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-elevated animate-in fade-in zoom-in duration-200">
            <h3 className="font-display text-lg font-bold text-foreground">
              Sign In Required
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Please sign in to view creator details.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAuthModal(false)}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowAuthModal(false);
                  navigate("/login", { state: { from: pendingRedirectUrl } });
                }}
                className="rounded-full gradient-sunset border-0 text-white shadow-glow"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
