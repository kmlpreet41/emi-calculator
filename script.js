
  const principalNum = document.getElementById('principalNum');
  const principalRange = document.getElementById('principalRange');
  const rateNum = document.getElementById('rateNum');
  const rateRange = document.getElementById('rateRange');
  const tenureNum = document.getElementById('tenureNum');
  const tenureRange = document.getElementById('tenureRange');

  const fmt = n => '₹' + Math.round(n).toLocaleString('en-IN');

  function sync(numEl, rangeEl){
    numEl.addEventListener('input', () => { rangeEl.value = numEl.value; calculate(); });
    rangeEl.addEventListener('input', () => { numEl.value = rangeEl.value; calculate(); });
  }
  sync(principalNum, principalRange);
  sync(rateNum, rateRange);
  sync(tenureNum, tenureRange);

  function calculate(){
    const P = parseFloat(principalNum.value) || 0;
    const annualRate = parseFloat(rateNum.value) || 0;
    const years = parseFloat(tenureNum.value) || 0;
    const n = Math.round(years * 12);
    const r = annualRate / 12 / 100;

    let emi;
    if (r === 0) {
      emi = n > 0 ? P / n : 0;
    } else {
      emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    }
    if (!isFinite(emi) || n === 0) emi = 0;

    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;

    document.getElementById('principalVal').textContent = fmt(P);
    document.getElementById('rateVal').textContent = annualRate + '%';
    document.getElementById('tenureVal').textContent = years + (years == 1 ? ' year' : ' years');

    document.getElementById('emiOut').textContent = fmt(emi);
    document.getElementById('principalOut').textContent = fmt(P);
    document.getElementById('interestOut').textContent = fmt(totalInterest);
    document.getElementById('totalOut').textContent = fmt(totalPayment);

    const pPct = totalPayment > 0 ? (P / totalPayment) * 100 : 50;
    document.getElementById('barPrincipal').style.width = pPct + '%';
    document.getElementById('barInterest').style.width = (100 - pPct) + '%';

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + n);
    document.getElementById('endOut').textContent = endDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

    buildSchedule(P, r, n, emi, years);
  }

  function buildSchedule(P, r, n, emi, years){
    const tbody = document.getElementById('scheduleBody');
    tbody.innerHTML = '';
    let balance = P;
    let yearPrincipal = 0;
    let yearInterest = 0;
    const totalYears = Math.ceil(n / 12);

    for (let m = 1; m <= n; m++){
      const interestPart = balance * r;
      let principalPart = emi - interestPart;
      if (m === n) principalPart = balance;
      balance -= principalPart;
      yearPrincipal += principalPart;
      yearInterest += interestPart;

      if (m % 12 === 0 || m === n){
        const yearNum = Math.ceil(m / 12);
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>Year ${yearNum}</td>
          <td>${fmt(yearPrincipal)}</td>
          <td>${fmt(yearInterest)}</td>
          <td>${fmt(Math.max(balance,0))}</td>
        `;
        tbody.appendChild(row);
        yearPrincipal = 0;
        yearInterest = 0;
      }
    }
  }

  calculate();