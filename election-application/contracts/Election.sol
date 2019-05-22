pragma solidity ^0.5.0;

contract Election {

	// Model a Candidate
	struct Candidate {
		uint id;
		string name;
		uint voteCount;
	}

	// Store Candidates
	mapping(uint => Candidate) public candidates;

	// Store Candidates Count
	uint public candidatesCount;

	constructor() public {
	}

}