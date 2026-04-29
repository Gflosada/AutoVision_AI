import { useNavigate } from "react-router";
import { Sparkles, Palette, Wrench, Layers, Zap, Shield } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Visualization",
      description: "See your custom build before spending a dime. Our AI preserves your vehicle's exact angle and lighting.",
    },
    {
      icon: Palette,
      title: "Unlimited Styles",
      description: "From luxury wraps to JDM builds. Matte, gloss, chrome, carbon fiber, and everything in between.",
    },
    {
      icon: Layers,
      title: "Full Customization",
      description: "Wraps, paint, rims, decals, body kits, spoilers, tint, lights, and carbon fiber parts.",
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Generate photorealistic renders in seconds. No waiting, no expensive mockups.",
    },
    {
      icon: Wrench,
      title: "Shop Integration",
      description: "Connect with certified wrap and customization shops. Share your build and get instant quotes.",
    },
    {
      icon: Shield,
      title: "HD Export",
      description: "Download high-resolution images perfect for shop consultations and social media.",
    },
  ];

  const steps = [
    { number: "01", title: "Upload Your Car", description: "Take a photo of your vehicle from any angle" },
    { number: "02", title: "Choose Modifications", description: "Select wraps, paint, rims, decals, and more" },
    { number: "03", title: "Describe Your Vision", description: "Use AI prompts to dial in your dream build" },
    { number: "04", title: "Generate & Download", description: "Get photorealistic renders in seconds" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="chrome-text">AutoVision AI</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2 text-foreground hover:text-primary transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/dashboard/new-build")}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg neon-glow hover:brightness-110 transition-all"
            >
              Start Customizing
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-glow/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 glass-panel rounded-full">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">AI-Powered Vehicle Customization</span>
              </div>

              <h1 className="text-5xl lg:text-6xl tracking-tight">
                Design Your Dream Build{" "}
                <span className="text-primary">Before You Touch the Paint</span>
              </h1>

              <p className="text-xl text-muted-foreground">
                Use AI to preview wraps, colors, rims, decals, and aftermarket modifications on your real vehicle.
                Make confident decisions before committing to expensive customization work.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate("/dashboard/new-build")}
                  className="px-8 py-4 bg-primary text-primary-foreground rounded-lg neon-glow hover:brightness-110 transition-all"
                >
                  Start Customizing
                </button>
                <button
                  onClick={() => navigate("/demo")}
                  className="px-8 py-4 glass-panel text-foreground rounded-lg hover:bg-muted/50 transition-all"
                >
                  View Demo
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div>
                  <p className="text-3xl chrome-text">50K+</p>
                  <p className="text-sm text-muted-foreground">Builds Generated</p>
                </div>
                <div>
                  <p className="text-3xl chrome-text">2.5s</p>
                  <p className="text-sm text-muted-foreground">Avg Generation</p>
                </div>
                <div>
                  <p className="text-3xl chrome-text">15K+</p>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </div>
              </div>
            </div>

            {/* Right content - Hero image */}
            <div className="relative">
              <div className="relative glass-panel rounded-2xl overflow-hidden border-2 border-primary/20">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1760550517469-24a705aec2d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw2fHxjdXN0b20lMjBjYXIlMjB3cmFwJTIwbW9kaWZpZWQlMjB2ZWhpY2xlfGVufDF8fHx8MTc3NzQxNjM4OXww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Custom car visualization"
                  className="w-full h-auto"
                />
                {/* Scan line overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/0 via-primary/10 to-primary/0 scan-line" />
              </div>

              {/* Floating AI prompt card */}
              <div className="absolute -bottom-6 -left-6 glass-panel rounded-xl p-4 border border-primary/30 max-w-xs">
                <p className="text-xs text-muted-foreground mb-2">AI Prompt</p>
                <p className="text-sm text-foreground">
                  "Vibrant paint splatter wrap, matte finish, custom wheels, aggressive stance"
                </p>
                <div className="flex gap-2 mt-3">
                  <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs">Custom Wrap</span>
                  <span className="px-2 py-1 bg-purple-glow/20 text-purple-glow rounded text-xs">Matte</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Before/After Preview */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4">See the Transformation</h2>
            <p className="text-muted-foreground text-lg">Real vehicles. Real AI-powered customization.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-panel rounded-xl p-6 space-y-4">
              <div className="relative rounded-lg overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1759295199382-aa4f1bc50db2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b20lMjBjYXIlMjB3cmFwJTIwbW9kaWZpZWQlMjB2ZWhpY2xlfGVufDF8fHx8MTc3NzQxNjM4OXww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Custom racing build"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm">
                  After AI
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Racing livery + performance wheels + lowered stance</p>
            </div>

            <div className="glass-panel rounded-xl p-6 space-y-4">
              <div className="relative rounded-lg overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1776692708282-a623a562de9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw3fHxjdXN0b20lMjBjYXIlMjB3cmFwJTIwbW9kaWZpZWQlMjB2ZWhpY2xlfGVufDF8fHx8MTc3NzQxNjM4OXww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Neon wrap build"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm">
                  After AI
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Neon green wrap + gloss finish + carbon accents</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl mb-4">Everything You Need to Design Your Build</h2>
            <p className="text-muted-foreground text-lg">Professional-grade tools powered by cutting-edge AI</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="glass-panel rounded-xl p-6 hover:border-primary/30 transition-all">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">From upload to download in 4 simple steps</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                <div className="glass-panel rounded-xl p-6 h-full">
                  <div className="text-5xl chrome-text mb-4">{step.number}</div>
                  <h3 className="text-xl mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary to-purple-glow" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl mb-4">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground text-lg">Choose the plan that fits your customization needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="glass-panel rounded-xl p-8">
              <h3 className="text-xl mb-2">Free</h3>
              <p className="text-muted-foreground mb-6">Perfect for trying it out</p>
              <div className="mb-6">
                <span className="text-4xl">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="text-sm flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary" />
                  3 generations/month
                </li>
                <li className="text-sm flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary" />
                  Standard quality
                </li>
                <li className="text-sm flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary" />
                  Watermark on exports
                </li>
              </ul>
              <button className="w-full px-6 py-3 glass-panel rounded-lg hover:bg-muted/50 transition-all">
                Get Started
              </button>
            </div>

            <div className="glass-panel rounded-xl p-8 border-2 border-primary gradient-border relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground rounded-full text-sm">
                Most Popular
              </div>
              <h3 className="text-xl mb-2">Pro</h3>
              <p className="text-muted-foreground mb-6">For serious enthusiasts</p>
              <div className="mb-6">
                <span className="text-4xl">$29</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="text-sm flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary" />
                  100 generations/month
                </li>
                <li className="text-sm flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary" />
                  HD export quality
                </li>
                <li className="text-sm flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary" />
                  No watermark
                </li>
                <li className="text-sm flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary" />
                  Full build history
                </li>
              </ul>
              <button
                onClick={() => navigate("/pricing")}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg neon-glow hover:brightness-110 transition-all"
              >
                Get Started
              </button>
            </div>

            <div className="glass-panel rounded-xl p-8">
              <h3 className="text-xl mb-2">Business</h3>
              <p className="text-muted-foreground mb-6">For shops & professionals</p>
              <div className="mb-6">
                <span className="text-4xl">$99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="text-sm flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary" />
                  500 generations/month
                </li>
                <li className="text-sm flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary" />
                  Shop profile page
                </li>
                <li className="text-sm flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary" />
                  Client galleries
                </li>
                <li className="text-sm flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary" />
                  Custom branding
                </li>
              </ul>
              <button className="w-full px-6 py-3 glass-panel rounded-lg hover:bg-muted/50 transition-all">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center glass-panel rounded-2xl p-12">
          <h2 className="text-4xl mb-4">Ready to See Your Dream Build?</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join thousands of car enthusiasts using AI to design their perfect custom vehicle.
          </p>
          <button
            onClick={() => navigate("/dashboard/new-build")}
            className="px-8 py-4 bg-primary text-primary-foreground rounded-lg neon-glow hover:brightness-110 transition-all"
          >
            Start Customizing Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="chrome-text mb-4">AutoVision AI</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered vehicle customization platform
              </p>
            </div>
            <div>
              <h4 className="mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Features</li>
                <li>Pricing</li>
                <li>Gallery</li>
                <li>Shop Mode</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Privacy</li>
                <li>Terms</li>
                <li>Cookie Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 AutoVision AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
