App = {
    loading: false,
    contracts: {},

    load: async() => {
        await App.loadWeb3()
        await App.loadAccount()
        await App.loadContract()
        await App.render()
    },

    loadWeb3: async () => {
      if (typeof web3 !== 'undefined') {
        App.web3Provider = web3.currentProvider
        web3 = new Web3(web3.currentProvider)
      } else {
        window.alert("Please connect to Metamask.")
      }
      // Modern dapp browsers...
      if (window.ethereum) {
        window.web3 = new Web3(ethereum)
        try {
          // Request account access if needed
          await ethereum.enable()
          // Accounts now exposed
          web3.eth.sendTransaction({/* ... */})
        } catch (error) {
          // User denied account access...
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        App.web3Provider = web3.currentProvider
        window.web3 = new Web3(web3.currentProvider)
        // Acccounts always exposed
        web3.eth.sendTransaction({/* ... */})
      }
      // Non-dapp browsers...
      else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
      }
    },

    loadAccount: async() => {
        // Load account data
        App.account = web3.eth.accounts[0]
    },

    loadContract: async() => {
       // Create a java script version of the smart contract
        const election = await $.getJSON('Election.json')

        // Instantiate a new truffle contract from the artifact
        App.contracts.Election = TruffleContract(election);
        // Connect provider to interact with contract
        App.contracts.Election.setProvider(App.web3Provider);

        // Hydrate the smart contract with values from the blockchain
        App.election = await App.contracts.Election.deployed()
    },

    render: async() => {
        // Prevent double render
        if(App.loading) {
            return
        }
        // Update app loading state
        App.setLoading(true)
        
        // Show account in html
         $("#accountAddress").html("Your Account: " + App.account)
        
        // Render tasks
        await App.renderCandidates()
        
        // Update loading state
        App.setLoading(false)
    },

    renderCandidates: async() => {
        const candidatesCount = await App.election.candidatesCount()
        var candidatesResults = $("#candidatesResults");
        candidatesResults.empty();

        for(var i=1; i<= candidatesCount; i++) {
            const candidate = await App.election.candidates(i)
            const id = candidate[0]
            const name = candidate[1]
            const voteCount = candidate[2]

            var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
            candidatesResults.append(candidateTemplate)
        }
    },

    setLoading: (boolean) => {
        App.loading = boolean
        const loader = $('#loader')
        const content = $('#content')
        if(boolean) {
            loader.show()
            content.hide()
        } else {
            loader.hide()
            content.show()
        }
    }
};

$(() => {
    $(window).load(() => {
        App.load()
    })
})