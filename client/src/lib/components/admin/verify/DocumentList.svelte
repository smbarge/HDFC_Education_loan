<script>
  export let docs = [];
  export let docVerification = {};
  export let sectionStatus = 'pending';
  export let sectionLabel = '';
  export let checkpointsByDoc = {};
  export let checkpointAnswers = {};
  export let applicationId = null;
  export let adminToken = '';

  export let expandedDocId = null;
  export let expandedDocUrl = null;
  export let expandedDocName = '';


  export let appData = null;
  export let masters = {};
  import { createEventDispatcher, onMount } from 'svelte';
  import { getVerificationAnswers, saveAnswers } from '$lib/api/adminapi.js';

 // console.log("Masters...",masters)
// function getFilledDataForQuestion(questionText) {
//   if (!appData || !questionText) return null;
//   const q = questionText.toLowerCase();
//   const p = appData.personal || {};
//   const edu = appData.education || {};
//   const g = appData.guarantor || {};

//   // Addhar card
//   if (q.includes('aadhaar number') || q.includes('aadhar number'))   return p.aadhar || null;
//   if (q.includes('name of the applicant') || (q.includes('name') && q.includes('correct'))) return p.name || null;
//   if (q.includes('date of birth') || q.includes('dob'))              return p.dob ? new Date(p.dob).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : null;
//   if (q.includes('gender'))                                           return p.gender ? `${p.gender.toUpperCase()} - ${p.gender.toLowerCase()==='male'?'पुरुष':p.gender.toLowerCase()==='female'?'महिला':p.gender}` : null;
//   if (q.includes('address'))                                          return p.current_address ? [p.current_address,p.current_place,p.current_pincode].filter(Boolean).join(', ') : null;
 
//   //Pan card
//   if (q.includes('name on the PAN card') || (q.includes('name'))) return p.name || null;
//   if (q.includes('pan') && (q.includes('number')||q.includes('correct')||q.includes('matching'))) return p.pan || null;
 

//   if (q.includes('mobile') || q.includes('phone'))                   return p.mobile || null;
  
//   //Minority

//   //if (q.includes('religion'))                                      return p.religion || null;
//   if (q.includes('certificate match the applicant’s details?'))      return p.caste || p.category || null;
//   //m
//   if (q.includes('minority') || q.includes('religion'))              return p.religion || null;
 
//   //Domasile  
//   //if (q.includes('domicile') || q.includes('state of domicile'))     return p.resident || p.domicile_state || null;
  
//   if (q.includes('marital'))                                          return p.marital_status || null;
//   if (q.includes('guardian') || q.includes('parent') || q.includes("father") || q.includes("mother")) return p.guardian_name || null;
//   if (q.includes('occupation'))                                       return p.occupation || null;
//   if (q.includes('income'))                                           return p.income ? '₹'+Number(p.income).toLocaleString('en-IN') : null;
//   if (q.includes('ration card'))                                      return p.ration_card_number || null;

//   //Education
//   if (q.includes('course name') || q.includes('programme'))          return edu.course_name || null;
//   if (q.includes('institute') || q.includes('college'))     return edu.institution_name || null;
//   if (q.includes('university'))                                      return edu.university || edu.institution_name || null;
//   if (q.includes('academic year'))                                   return edu.admission_year ? String(edu.admission_year) : null;
//   if (q.includes('admission status'))                                 return edu.admission_status || null;
//   if (q.includes('mode of study'))                                    return edu.mode_of_study || null;
//   if (q.includes('total') && q.includes('fee'))                      return edu.total_course_fee ? '₹'+Number(edu.total_course_fee).toLocaleString('en-IN') : null;
//   if (q.includes('marksheets belong to the applicant') || (q.includes('name'))) return p.name || null;
  
//   if (q.includes('loan amount') || q.includes('loan required'))      return edu.loan_required_amount ? '₹'+Number(edu.loan_required_amount).toLocaleString('en-IN') : null;
  
//   //Bank
//   if (q.includes('bank name'))                                        return edu.bank_name || null;
//   if (q.includes('branch'))                                           return edu.branch_name || null;
//   if (q.includes('ifsc'))                                             return edu.ifsc_code || null;
//   if (q.includes('account number'))                                   return edu.account_number || null;

//   if (q.includes('guarantor') && q.includes('name'))                 return g.name || null;
//   if (q.includes('guarantor') && q.includes('mobile'))               return g.mobile || null;
//   if (q.includes('guarantor') && (q.includes('aadhaar')||q.includes('aadhar'))) return g.aadhar || null;
//   if (q.includes('guarantor') && q.includes('income'))               return g.income ? '₹'+Number(g.income).toLocaleString('en-IN') : null;
//   if (q.includes('guarantor') && q.includes('address'))              return g.current_address ? [g.current_address,g.current_place,g.current_pincode].filter(Boolean).join(', ') : null;

//   //Abrod 
//   if (q.includes('passport belong'))    return p.name || null;
//   if (q.includes('visa contain correct applicant details'))    return p.name || null;


//   // Collateral — FD
//   const fds = (appData.collateral?.fds || [])[0] || {};
//     if (q.includes('holder details'))                 return g.name || null;
//     if (q.includes('amount') || q.includes('value'))   return fds.fd_amount ? '₹'+Number(fds.fd_amount).toLocaleString('en-IN') : null;
//     if (q.includes('bank'))                            return fds.bank_name || null;
//     if (q.includes('account'))                         return fds.fd_acc_no || null;
//     if (q.includes('maturity'))                        return fds.maturity_date || null;
//     if (q.includes('fd details') || q.includes('fixed deposit details'))
//     return `Bank: ${fds.bank_name || '-'}, Branch: ${fds.branch_name || '-'}, Account: ${fds.fd_acc_no || '-'}`;

//   // Collateral — Property
//   const prop = (appData.collateral?.properties || [])[0] || {};
//     if (q.includes('owner'))    return prop.owner_name || null;
//     if (q.includes('area'))     return prop.area || null;
//     if (q.includes('survey') || q.includes('7/12')) return prop.survey_number || null;
//     if (q.includes('value') || q.includes('valuation')) return prop.property_value ? '₹'+Number(prop.property_value).toLocaleString('en-IN') : null;
//     if (q.includes('address') || q.includes('location')) return prop.address || prop.village || null;


//   // Collateral — LIC
//   const lic = (appData.collateral?.lics || [])[0]||{};
//     if (q.includes('number'))   return lic.policy_number || null;
//     if (q.includes('amount') || q.includes('sum assured')) return lic.sum_assured ? '₹'+Number(lic.sum_assured).toLocaleString('en-IN') : null;
//     if (q.includes('premium'))  return lic.premium_amount ? '₹'+Number(lic.premium_amount).toLocaleString('en-IN') : null;
//     if (q.includes('maturity')) return lic.maturity_date || null;
//     if (q.includes('holder') || q.includes('name')) return lic.holder_name || null;

//   // Collateral — Govt Employee
//   const govt = (appData.collateral?.govtEmployees || [])[0]||{};
//     if (q.includes('name'))       return govt.employee_name || null;
//     if (q.includes('department') || q.includes('office')) return govt.department || govt.office_name || null;
//     if (q.includes('salary') || q.includes('income'))     return govt.salary ? '₹'+Number(govt.salary).toLocaleString('en-IN') : null;
//     if (q.includes('designation'))  return govt.designation || null;
//     if (q.includes('employee id') || q.includes('id card')) return govt.employee_id || null;

//   return null;
// }


function getFilledDataForQuestion(questionText) {
  if (!appData || !questionText) return null;
  const q = questionText.toLowerCase();
  const p = appData.personal || {};
  const edu = appData.education || {};
  const g = appData.guarantor || {};


  // personal
  if (q.includes('aadhaar number') || q.includes('aadhar number'))
    return p.aadhar || null;
  if (q.includes('name of the applicant') || (q.includes('name') && q.includes('correct')))
    return p.name || null;
  if (q.includes('date of birth') || q.includes('dob'))
    return p.dob ? new Date(p.dob).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : null;
  if (q.includes('gender'))

  return p.gender || masters.genderMap?.[p.gender] || null;
 if (q.includes('address'))
  return p.current_address ? [
    p.current_address, p.current_place,
    masters.districtMap?.[p.current_district] || '',
    p.current_pincode
  ].filter(Boolean).join(', ') : null;

  if (q.includes('district'))
    return masters.districtMap?.[p.current_district] || null;

  //PAN card
  if (q.includes('name on the PAN card') || (q.includes('name'))) return p.name || null;
  if (q.includes('pan') && (q.includes('number')||q.includes('correct')||q.includes('matching')))
    return p.pan || null;

  if (q.includes('mobile') || q.includes('phone'))
    return p.mobile || null;
  if (q.includes('minority') || q.includes('cast'))
    return masters.religionMap?.[p.religion] || p.religion || null;
  if (q.includes('caste') || q.includes('category'))
    return p.caste || p.category || null;
  if (q.includes('domicile') || q.includes('state of domicile'))
    return p.resident || null;
  if (q.includes('marital'))
    return masters.maritalMap?.[p.marital_status] || p.marital_status || null;
  if (q.includes('guardian') || q.includes('parent') || q.includes('father') || q.includes('mother'))
    return p.guardian_name || null;
  if (q.includes('occupation'))
    return masters.occupationMap?.[p.occupation] || p.occupation || null;
  if (q.includes('income'))
    return p.income ? '₹'+Number(p.income).toLocaleString('en-IN') : null;
  if (q.includes('ration card'))
    return p.ration_card_number || null;

  // education
  if (q.includes('marksheets belong to the applicant') || (q.includes('name'))) return p.name || null;

  if (q.includes('course name') || q.includes('programme'))
    return edu.course_name || null;
  if (q.includes('institute') || q.includes('college'))
    return edu.institution_name || null;
  if (q.includes('university'))
    return edu.university || edu.institution_name || null;
  if (q.includes('academic year') || q.includes('admission year'))
    return edu.admission_year ? String(edu.admission_year) : null;
  if (q.includes('admission status'))
    return masters.admissionMap?.[edu.admission_status] || edu.admission_status || null;
  if (q.includes('mode of study'))
    return masters.modeStudyMap?.[edu.mode_of_study] || edu.mode_of_study || null;
  if (q.includes('total') && q.includes('fee'))
    return edu.total_course_fee ? '₹'+Number(edu.total_course_fee).toLocaleString('en-IN') : null;
  if (q.includes('loan amount') || q.includes('loan required'))
    return edu.loan_required_amount ? '₹'+Number(edu.loan_required_amount).toLocaleString('en-IN') : null;

  // bank
  if (q.includes('bank name'))   return edu.bank_name || null;
  if (q.includes('branch'))      return edu.branch_name || null;
  if (q.includes('ifsc'))        return edu.ifsc_code || null;
  if (q.includes('account number')) return edu.account_number || null;

  // gurantor
  if (q.includes('guarantor') && q.includes('name'))    return g.name || null;
  if (q.includes('guarantor') && q.includes('mobile'))  return g.mobile || null;
  if (q.includes('guarantor') && q.includes('gender'))
    return masters.genderMap?.[g.gender]|| null;
  if (q.includes('guarantor') && (q.includes('aadhaar')||q.includes('aadhar'))) return g.aadhar || null;
  if (q.includes('guarantor') && q.includes('income'))
    return g.income ? '₹'+Number(g.income).toLocaleString('en-IN') : null;
  if (q.includes('guarantor') && q.includes('address'))
    return g.current_address ? [
      g.current_address, g.current_place,
      masters.districtMap?.[g.current_district],
      g.current_pincode
    ].filter(Boolean).join(', ') : null;


 //Abrod 
  if (q.includes('passport belong'))    return p.name || null;
  if (q.includes('visa contain correct applicant details'))    return p.name || null;

  // collateral - FD
  const fds = (appData.collateral?.fds || [])[0] || {};
  if (q.includes('fd') || q.includes('fixed deposit')) {
    if (q.includes('bank'))     return fds.bank_name || null;
    if (q.includes('account'))  return fds.fd_acc_no || null;
    if (q.includes('amount'))   return fds.amount ? '₹'+Number(fds.amount).toLocaleString('en-IN') : null;
    if (q.includes('maturity')) return fds.fd_maturity_date ? new Date(fds.fd_maturity_date).toLocaleDateString('en-IN') : null;
  }

  // collateral - property
  const prop = (appData.collateral?.properties || [])[0] || {};
  if (q.includes('survey') || q.includes('7/12')) return prop.survey_no || null;
  if (q.includes('valuation') || (q.includes('value') && q.includes('property')))
    return prop.property_value ? '₹'+Number(prop.property_value).toLocaleString('en-IN') : null;

  // collateral - gov employee
  const govt = (appData.collateral?.govtEmployees || [])[0] || {};
  if (q.includes('department') || q.includes('office name'))
    return govt.department_office_name || null;
  if (q.includes('designation'))  return govt.designation || null;
  if (q.includes('employee id'))  return govt.employee_id_number || null;

  return null;
}
  const dispatch = createEventDispatcher();

  // Load existing answers on mount from new /api/admin/verification
  // onMount(async () => {
  //   if (!applicationId || !adminToken) return;
  //   try {
  //     const res = await fetch(
  //       `/api/admin/verification?application_id=${applicationId}`,
  //       { headers: { 'Authorization': `Bearer ${adminToken}` }, credentials: 'include' }
  //     );
  //     const data = await res.json();
  //     if (data.error === 0 && data.answers) {
  //       const converted = {};
  //       Object.entries(data.answers).forEach(([k, v]) => {
  //         converted[k] = (v === 1 || v === '1') ? 'yes' : (v === 2 || v === '2') ? 'no' : v;
  //       });
  //       checkpointAnswers = { ...checkpointAnswers, ...converted };
  //     }
  //   } catch (e) { console.error('Load answers error:', e); }
  // });


  // Load existing answers on mount via adminapi
  onMount(async () => {
    if (!applicationId || !adminToken) return;
    const data = await getVerificationAnswers(adminToken, applicationId);
    if (data.error === 0 && data.answers) {
      const converted = {};
      Object.entries(data.answers).forEach(([k, v]) => {
        converted[k] = (v === 1 || v === '1') ? 'yes' : (v === 2 || v === '2') ? 'no' : v;
      });
      checkpointAnswers = { ...checkpointAnswers, ...converted };
    }
  });

  // pendingAnswers holds in-memory answers not yet saved
  let pendingAnswers = {};

  function recordAnswer(questionId, checkpointId, answer) {
    checkpointAnswers[questionId] = answer;
    checkpointAnswers = { ...checkpointAnswers };
    pendingAnswers[questionId] = { checkpoint_id: checkpointId, question_id: questionId, answer };
  }

  // Save & Continue — sends all pending answers to backend in one call
  // async function handleSave() {
  //   if (!allCheckpointsAnswered) return;
  //   if (applicationId && adminToken && Object.keys(pendingAnswers).length > 0) {
  //     try {
  //       await fetch('/api/admin/verification', {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'Authorization': `Bearer ${adminToken}`
  //         },
  //         credentials: 'include',
  //         body: JSON.stringify({
  //           action: 'saveAnswers',
  //           application_id: applicationId,
  //           answers: Object.values(pendingAnswers)
  //         })
  //       });
  //       pendingAnswers = {};
  //     } catch (e) { console.error('Save answers error:', e); }
  //   }
  //   dispatch('saveDoc', { docId: expandedDocId });
  //   expandedDocId = null;
  //   expandedDocUrl = null;
  //   expandedDocName = '';
  // }


  // Save & Continue — sends all pending answers via adminapi
  async function handleSave() {
    if (!allCheckpointsAnswered) return;
    if (applicationId && adminToken && Object.keys(pendingAnswers).length > 0) {
      await saveAnswers(adminToken, {
        application_id: applicationId,
        answers: Object.values(pendingAnswers)
      });
      pendingAnswers = {};
    }
    dispatch('saveDoc', { docId: expandedDocId });
    expandedDocId = null;
    expandedDocUrl = null;
    expandedDocName = '';
  }

  
  function getQuestionsForDoc(documentId) {
    const docId = String(documentId);
    const entry = checkpointsByDoc[docId];
    return entry ? entry.questions : [];
  }

  $: scores = (() => {
    const map = {};
    (docs || []).forEach(doc => {
      const questions = getQuestionsForDoc(doc.document_id);
      if (questions.length === 0) { map[doc.document_id] = null; return; }
      const yes = questions.filter(q => checkpointAnswers[q.id] === 'yes').length;
      map[doc.document_id] = { yes, total: questions.length };
    });
    return map;
  })();

  function openDoc(doc) {
    if (expandedDocId === doc.document_id) {
      expandedDocId = null;
      expandedDocUrl = null;
      expandedDocName = '';
    } else {
      expandedDocId = doc.document_id;
      expandedDocUrl = doc.file_name;
      expandedDocName = doc.document_name;
    }
  }

  // True when every checkpoint for the expanded doc is answered
  $: allCheckpointsAnswered = (() => {
    if (!expandedDocId) return true;
    const questions = getQuestionsForDoc(expandedDocId);
    if (questions.length === 0) return true;
    return questions.every(q => checkpointAnswers[q.id] === 'yes' || checkpointAnswers[q.id] === 'no');
  })();

 
</script>

<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">

  <!-- Header
  <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
    <div>
      <p class="text-base font-semibold text-gray-800">{sectionLabel}</p>
      <p class="text-sm text-gray-400 mt-0.5">{docs.length} document{docs.length !== 1 ? 's' : ''}</p>
    </div>
  </div> -->

  <!-- Document Rows -->
  {#if docs.length === 0}
    <div class="py-12 text-center text-gray-400 text-base">No documents in this section</div>
  {:else}
    <div class="divide-y divide-gray-100">
      {#each docs as doc}
        {@const status = docVerification[doc.document_id] || 'pending'}
        {@const score = scores[doc.document_id]}
        {@const questions = getQuestionsForDoc(doc.document_id)}
        {@const isExpanded = expandedDocId === doc.document_id}

        <!-- Row -->
        <div>
          <div
            class="flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer
              {isExpanded ? 'bg-blue-50' : 'hover:bg-gray-50'}"
            on:click={() => openDoc(doc)}
          >
            <!-- Doc icon -->
            <div class="w-8 h-8 rounded flex items-center justify-center flex-shrink-0
              {isExpanded ? 'bg-blue-100' : 'bg-gray-100'}">
              <svg class="w-4 h-4 {isExpanded ? 'text-blue-500' : 'text-gray-500'}"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
            </div>

            <!-- Name + section -->
            <div class="flex-1 min-w-0">
              <p class="text-base font-medium text-gray-800 truncate">{doc.document_name}</p>
            </div>

            <!-- Status badge -->
            {#if status === 'verified'}
              <span class="text-sm font-medium px-2 py-0.5 rounded border flex-shrink-0 text-green-600 bg-green-50 border-green-200">
                ✓ {score !== null ? `${score.yes}/${score.total}` : 'Verified'}
              </span>
            {:else if status === 'rejected'}
              <span class="text-sm font-medium px-2 py-0.5 rounded border flex-shrink-0 text-red-600 bg-red-50 border-red-200">
                ✕ {score !== null ? `${score.yes}/${score.total}` : 'Rejected'}
              </span>
            {:else if score !== null}
              <span class="text-sm font-medium px-2 py-0.5 rounded border flex-shrink-0
                {score.yes === score.total && score.total > 0
                  ? 'text-green-600 bg-green-50 border-green-200'
                  : score.yes === 0
                    ? 'text-gray-500 bg-gray-50 border-gray-200'
                    : 'text-amber-600 bg-amber-50 border-amber-200'}">
                {score.yes}/{score.total}
              </span>
            {:else}
              <span class="text-sm font-medium px-2 py-0.5 rounded border flex-shrink-0 text-gray-500 bg-gray-50 border-gray-200">
                ○ Pending
              </span>
            {/if}

            <!-- Expand/Collapse toggle -->
            <div class="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center
              {isExpanded ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {#if isExpanded}
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 12H4"/>
                {:else}
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16M4 12h16"/>
                {/if}
              </svg>
            </div>
          </div>

          <!-- Checkpoint questions — shown inline below the row when expanded -->
          {#if isExpanded && questions.length > 0}
            <div class="px-4 pb-3 bg-blue-50 border-t border-blue-100">
              <p class="text-xs font-bold text-yellow-700 uppercase tracking-wide pt-3 pb-2">Verification Checklist</p>
              <div class="space-y-2">
                 {#each questions as q}
                  {@const filledValue = getFilledDataForQuestion(q.question)}
                  <div class="flex items-start gap-3 bg-white rounded border border-yellow-100 px-3 py-2">
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-800">{q.question}</p>
                      {#if filledValue}
                        <div class="mt-1.5 px-3 py-1.5 bg-blue-50 border-l-4 border-blue-400 rounded-r text-sm font-semibold text-blue-900">
                          {filledValue}
                        </div>
                      {/if}
                      {#if q.instruction_eng}
                        <p class="text-xs text-gray-500 mt-0.5">{q.instruction_eng}</p>
                      {/if}
                      {#if q.mandatory_field === 'yes'}
                        <span class="text-xs text-red-500 font-semibold">* Mandatory</span>
                      {/if}
                    </div>
                    <div class="flex gap-1.5 flex-shrink-0 mt-0.5">
                      <button
                        on:click|stopPropagation={() => recordAnswer(q.id, q.checkpoint_id, 'yes')}
                        class="px-2.5 py-1 text-xs font-semibold rounded border transition-colors
                          {checkpointAnswers[q.id] === 'yes'
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-white text-green-700 border-green-300 hover:bg-green-50'}"
                      >Yes</button>
                        <button
                        on:click|stopPropagation={() => recordAnswer(q.id, q.checkpoint_id, 'no')}
                        class="px-2.5 py-1 text-xs font-semibold rounded border transition-colors
                          {checkpointAnswers[q.id] === 'no'
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-white text-red-600 border-red-300 hover:bg-red-50'}"
                      >No</button>
                    </div>
                  </div>
                {/each}
              </div>

              <!-- Save & Continue -->
              <div class="mt-3 pt-3 border-t border-blue-200">
                {#if !allCheckpointsAnswered}
                  <p class="text-xs text-amber-600 font-medium mb-2 flex items-center gap-1">
                    <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    </svg>
                    Answer all questions to continue.
                  </p>
                {/if}
                <button
                  on:click|stopPropagation={handleSave}
                  disabled={!allCheckpointsAnswered}
                  class="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded transition-colors
                    {allCheckpointsAnswered
                      ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                      : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'}"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                  </svg>
                  Save &amp; Continue
                </button>
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>