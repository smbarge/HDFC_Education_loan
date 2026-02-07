<script>
  // export let userData = {
  //   name: '',
  //   mobile: '',
  //   aadhar: '',
  //   pan: '',
  //   education: ''
  // };

  export let userData = {
    name: '',
    phone: '',
    username: ''
  };
</script>

<div class="bg-white rounded-xl shadow-md p-6 mb-6">
  <h2 class="text-center text-2xl font-bold text-gray-800 mb-6">
    Applicant Name/अर्जदाराचे नाव : {userData.name || 'N/A'}
  </h2>
  
  <div class="bg-purple-100 rounded-lg p-4 mb-4">
    <h3 class="text-center text-lg font-bold text-purple-800 mb-4">
      ONLINE APPLICANT DOCUMENT / CERTIFICATE UPLOAD FORM
    </h3>
    <p class="text-center text-sm text-purple-700">
      ऑनलाइन अर्जदार दस्तऐवज / प्रमाणपत्र अपलोड फॉर्म
    </p>
  </div>

  <div class="grid md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
    <div class="flex items-center gap-2">
      <span class="font-medium text-gray-700 min-w-[120px]">Name/नाव</span>
      <span class="text-gray-600">:</span>
      <span class="text-gray-800">{userData.name || 'N/A'}</span>
    </div>

    <div class="flex items-center gap-2">
      <span class="font-medium text-gray-700 min-w-[140px]">Mobile No/मोबाईल नंबर</span>
      <span class="text-gray-600">:</span>
      <span class="text-gray-800">{userData.phone || 'N/A'}</span>
    </div>

    <div class="flex items-center gap-2">
      <span class="font-medium text-gray-700 min-w-[120px]">Aadhar No/आधार आधार</span>
      <span class="text-gray-600">:</span>
      <span class="text-gray-800">{userData.username|| 'N/A'}</span>
    </div>

    <div class="flex items-center gap-2">
      <span class="font-medium text-gray-700 min-w-[140px]">PAN No/पॅन नंबर</span>
      <span class="text-gray-600">:</span>
      <span class="text-gray-800">{userData.name || 'N/A'}</span>
    </div>

    <div class="flex items-center gap-2 md:col-span-2">
      <span class="font-medium text-gray-700 min-w-[120px]">Education/शिक्षण</span>
      <span class="text-gray-600">:</span>
      <span class="text-gray-800">{userData.username || 'N/A'}</span>
    </div>
  </div>

  <div class="mt-6 text-center">
    <h4 class="text-xl font-bold text-purple-700 mb-1">Upload All Valid Documents</h4>
    <p class="text-sm text-purple-600">सर्व वैध कागदपत्रे अपलोड करा</p>
  </div>
</div>