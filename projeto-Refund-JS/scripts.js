// --- 1. BUSCANDO OS ELEMENTOS NO HTML ---
// Aqui eu pego o formulário e os campos de entrada (nome, categoria e valor)
const form = document.querySelector("form")
const amount = document.getElementById("amount")
const expense = document.getElementById("expense")
const category = document.getElementById("category")

// E aqui os lugares onde vou exibir os dados (a lista <ul> e os textos do resumo)
const expenseList = document.querySelector("ul")
const expensesTotal = document.querySelector("aside header h2")
const expenseQuantity = document.querySelector("aside header p span")

// --- 2. MÁSCARA DE MOEDA (UX) ---
// Toda vez que o usuário digita no campo de valor...
amount.oninput = () => {
    // Eu limpo o que não for número (tipo letras ou símbolos que o cara tente colar)
    let value = amount.value.replace(/\D/g, "")

    // Transformo em "centavos" pra facilitar a formatação (ex: 150 vira 1.50)
    value = Number(value) / 100

    // Devolvo pro campo o valor já bonitinho como "R$ 0,00"
    amount.value = formatCurrencyBRL(value)
}

// Funçãozinha auxiliar pra formatar números no padrão Real Brasileiro
function formatCurrencyBRL(value) {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    })
}

// --- 3. ADICIONANDO A DESPESA ---
// Quando clicar no botão de enviar (ou der Enter)...
form.onsubmit = (event) => {
    // Aviso o navegador: "Ei, não recarrega a página não, eu cuido disso!"
    event.preventDefault()

    // Crio um pacotinho (objeto) com tudo que preciso daquela despesa
    const newExpense = {
        id: new Date().getTime(), // Uso o timestamp como ID único
        expense: expense.value,
        category_id: category.value,
        category_name: category.options[category.selectedIndex].text,
        amount: amount.value,
        created_at: new Date(),
    }

    // Mando esse pacotinho pra função que desenha na tela
    expenseAdd(newExpense)
}

function expenseAdd(newExpense) {
    try {
        // Crio o <li> que vai segurar a despesa
        const expenseItem = document.createElement("li")
        expenseItem.classList.add("expense")

        // Coloco o ícone baseado no ID da categoria (ex: food.svg, transport.svg)
        const expenseIcon = document.createElement("img")
        expenseIcon.setAttribute("src", `img/${newExpense.category_id}.svg`)
        expenseIcon.setAttribute("alt", newExpense.category_name)

        // Crio a div com os textos (nome e categoria)
        const expenseInfo = document.createElement("div")
        expenseInfo.classList.add("expense-info")

        const expenseName = document.createElement("strong")
        expenseName.textContent = newExpense.expense

        const expenseCategory = document.createElement("span")
        expenseCategory.textContent = newExpense.category_name

        expenseInfo.append(expenseName, expenseCategory)

        // Crio o valor (separando o "R$" pra estilizar menor se quiser)
        const expenseAmount = document.createElement("span")
        expenseAmount.classList.add("expense-amount")
        expenseAmount.innerHTML = `<small>R$</small>${newExpense.amount.toUpperCase().replace("R$", "")}`

        // Botão de lixeira
        const removeIcon = document.createElement("img")
        removeIcon.classList.add("remove-icon")
        removeIcon.setAttribute("src", "img/remove.svg")
        removeIcon.setAttribute("alt", "Remover")

        // Monto o "quebra-cabeça" dentro da li e jogo na lista principal
        expenseItem.append(expenseIcon, expenseInfo, expenseAmount, removeIcon)
        expenseList.append(expenseItem)

        // Limpo o form e foco no primeiro campo pra próxima despesa
        formClear()
        // Atualizo os cálculos do topo da tela
        updateTotals()

    } catch (error) {
        alert("Ops, deu ruim ao adicionar a despesa.")
        console.log(error)
    }
}

// --- 4. CONTABILIDADE (SOMA TUDO) ---
function updateTotals() {
    try {
        const items = expenseList.children

        // Atualizo o texto de "X despesas"
        expenseQuantity.textContent = `${items.length} ${items.length > 1 ? "despesas" : "despesa"}`

        let total = 0

        // Percorro cada item da lista pra somar os valores
        for (let item = 0; item < items.length; item++) {
            const itemAmount = items[item].querySelector(".expense-amount")

            // Aqui eu faço o caminho inverso: tiro o R$ e a vírgula pra virar número de novo
            let value = itemAmount.textContent.replace(/[^\d,]/g, "").replace(",", ".")
            value = parseFloat(value)

            if (isNaN(value)) return alert("Tem algum valor estranho na lista!")

            total += Number(value)
        }

        // Formato o total final e exibo no topo
        const symbolBRL = document.createElement("small")
        symbolBRL.textContent = "R$"
        total = formatCurrencyBRL(total).toUpperCase().replace("R$", "")

        expensesTotal.innerHTML = ""
        expensesTotal.append(symbolBRL, total)

    } catch (error) {
        alert("Não consegui calcular os totais.")
    }
}

// --- 5. REMOÇÃO E LIMPEZA ---
// Escuto cliques na lista toda (Delegação de Eventos)
expenseList.addEventListener("click", function (event) {
    // Se o que eu cliquei for a lixeira...
    if (event.target.classList.contains("remove-icon")) {
        // Acho a <li> mais próxima e deleto
        const item = event.target.closest(".expense")
        item.remove()
    }
    // Re-calculo tudo depois de deletar
    updateTotals()
})

function formClear() {
    expense.value = ""
    category.value = ""
    amount.value = ""
    expense.focus()
}