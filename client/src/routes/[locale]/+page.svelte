<script>
  import Header from '$lib/components/landingpage/Header.svelte';
  import Hero from '$lib/components/landingpage/Hero.svelte';
  import StatsSection from '$lib/components/landingpage/StatsSection.svelte';
  import EligibilitySection from '$lib/components/landingpage/EligibilitySection.svelte';
  import BenefitsSection from '$lib/components/landingpage/BenefitsSection.svelte';
  import DocumentsSection from '$lib/components/landingpage/DocumentsSection.svelte';
  import Footer from '$lib/components/landingpage/Footer.svelte';

  export let data;

  const { t } = data;
</script>

<svelte:head>
  <title>{t.header.title}</title>
  <meta name="description" content={t.hero.description} />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
  <Header {t} />
  <Hero {t} />
  <BenefitsSection {t} />
  <EligibilitySection {t} />
  <DocumentsSection {t} />
  <StatsSection {t} />

  <section class="py-16 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">
        {t.quickAnswers.title}
      </h2>

      <div class="grid md:grid-cols-3 gap-6">

        <div class="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
          <h3 class="font-bold text-gray-900 mb-2">
            {t.quickAnswers.maxLoan.question}
          </h3>
          <p class="text-gray-600">
            {t.quickAnswers.maxLoan.answer}
          </p>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
          <h3 class="font-bold text-gray-900 mb-2">
            {t.quickAnswers.approval.question}
          </h3>
          <p class="text-gray-600">
            {t.quickAnswers.approval.answer}
          </p>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
          <h3 class="font-bold text-gray-900 mb-2">
            {t.quickAnswers.interest.question}
          </h3>
          <p class="text-gray-600">
            {t.quickAnswers.interest.answer}
          </p>
        </div>

      </div>
    </div>
  </section>

  <Footer {t} />
</div>
