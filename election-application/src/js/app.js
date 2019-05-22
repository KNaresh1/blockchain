App = {
    web3Provider: null,
    account: '0x0',
    contracts: {},

    load: async() => {
        App.initWeb3()
        App.initContract()
        App.loadAccount()
        App.render()
    },

    initWeb3: async() => {
        // TODO: refactor conditional
        if (typeof web3 !== 'undefined') {
            // If a web3 instance is already provided by Meta Mask.
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        } else {
            // Specify default instance if no web3 instance provided
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            web3 = new Web3(App.web3Provider);
        }
    },

    initContract: async() => {
        $.getJSON("Election.json", function(election) {
            // Instantiate a new truffle contract from the artifact
            App.contracts.Election = TruffleContract(election);
            // Connect provider to interact with contract
            App.contracts.Election.setProvider(App.web3Provider);
        });
    },

    loadAccount: async() => {
        // Load account data
        App.account = web3.eth.accounts[0]
    },

    render: async() => {
        var electionInstance;
        var loader = $("#loader");
        var content = $("#content");

        loader.show();
        content.hide();

        $("#accountAddress").html("Your Account: " + App.account)

        // Load contract data
        App.contracts.Election.deployed().then(function(instance) {
            electionInstance = instance;
            return electionInstance.candidatesCount();
        }).then(function(candidatesCount) {
            var candidatesResults = $("#candidatesResults");
            candidatesResults.empty();

            for (var i = 1; i <= candidatesCount; i++) {
                electionInstance.candidates(i).then(function(candidate) {
                    var id = candidate[0];
                    var name = candidate[1];
                    var voteCount = candidate[2];

                    // Render candidate Result
                    var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
                    candidatesResults.append(candidateTemplate);
                });
            }

            loader.hide();
            content.show();
        }).catch(function(error) {
            console.warn(error);
        });
    },
};

$(() => {
    $(window).load(() => {
        App.load()
    })
})