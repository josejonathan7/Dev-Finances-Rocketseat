//função toogle do document funciona como um intruptor que liga e desliga
const Modal = {
    //abrir modal
    open() {
        document.querySelector('.modal-overlay').classList.add('active');
    },
    //fechar o modal
    close() {
        document.querySelector('.modal-overlay').classList.remove('active');
    }
}

const Storage = {
    get(){
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions){
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const transaction = {
    all: Storage.get(),
    add(Transaction) {
        //o push é uma funcionalidade atrelada a listas/array
        transaction.all.push(Transaction)

        app.reload()
    },
    remove(index) {
        transaction.all.splice(index, 1)

        app.reload()
    },
    incomes() {
        //somar as entradas
        let income = 0
        //pegar as transações
        //para cada transação
        transaction.all.forEach((transaction) => {
            //se ela for maior que 0
            if (transaction.amount > 0) {
                //somar a uma variavel e retorna a variavel
                income += transaction.amount;
            }
        })
        //retornar a soma das entradas
        return income
    },
    expenses() {
        //somar as saidas
        let expense = 0

        transaction.all.forEach((transaction) => {
            if (transaction.amount < 0) {
                expense += transaction.amount
            }
        })

        return expense
    },
    total() {
        //entradas - saidas
        let total = transaction.incomes() + transaction.expenses();

        return total
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLtransaction(transaction, index);
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)

    },
    innerHTMLtransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            </td>

        `
        return html
    },
    updateBalance() {
        document.getElementById('incomeDisplay').innerHTML = utils.formatCurrency(transaction.incomes())
        document.getElementById('expenseDisplay').innerHTML = utils.formatCurrency(transaction.expenses())
        document.getElementById('totalDisplay').innerHTML = utils.formatCurrency(transaction.total());
    },
    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }

}

const utils = {
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""
        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    },
    formatAmount(value) {
        value = Number(value) * 100
        return value
    },
    formatDate(date) {
        //a data em forma de string é divida de maneira a se transformar em um array e o separador nesse caso é o -
        const splittedDate = date.split("-")
        //com a data divida em um array basta pegar a posição de cada conjunto dia, mes ,ano e organizar da forma que desejar para o retorno
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },
}

const Form = {
    description: document.querySelector('.input-group input#description'),
    amount: document.querySelector('.input-group input#amount'),
    date: document.querySelector('.input-group input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },
    validateFields() {
        const { description, amount, date } = Form.getValues()

        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor preencha todos os campos")
        }
    },
    formatValues() {
        let { description, amount, date } = Form.getValues()

        amount = utils.formatAmount(amount)

        date = utils.formatDate(date)

        return {
            description: description,
            amount: amount,
            date: date
        }
    },
    saveTransaction(transactions) {
        transaction.add(transactions)
    },
    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },
    submit(event) {
        event.preventDefault()

        try {
            //verificar s etodas as informações forem preenchidas
            Form.validateFields()
            //formatar os dados para salvar
            const transactionFormated = Form.formatValues()
            //salvar e reniciar a aplicação através do reload
            Form.saveTransaction(transactionFormated)
            //apagar os dados do formulário
            Form.clearFields()
            //fechar o modal
            Modal.close()
        } catch (error) {
            alert(error.message)
        }



    }
}

const app = {
    init() {
        transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index);
        })

        DOM.updateBalance()
    
        Storage.set(transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        app.init()
    }
}

app.init()


