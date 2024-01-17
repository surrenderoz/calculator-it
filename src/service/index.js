function find_subsets(numbers, target) {
    const results = [];

    function check_subset(subset) {
        if (Math.round(subset.reduce((sum, num) => sum + num, 0), 2) === target) {
            results.push(subset);
            return true;
        }
        return false;
    }

    for (let r = 1; r <= numbers.length; r++) {
        for (const subset of getCombinations(numbers, r)) {
            if (check_subset(subset)) {
                if (results.length >= 10) {
                    return results;
                }
            }
        }
    }

    return results;
}

function find_approximate_subsets(numbers, target) {
    numbers.sort((a, b) => b - a);
    let current_sum = 0;
    const subset = [];

    for (const num of numbers) {
        if (current_sum + num <= target) {
            current_sum += num;
            subset.push(num);
        }
    }

    return subset.length > 0 ? [subset] : [];
}

function getCombinations(arr, r) {
    const combinations = [];

    function generateCombination(start, index, currentCombination) {
        if (index === r) {
            combinations.push([...currentCombination]);
            return;
        }

        for (let i = start; i < arr.length; i++) {
            currentCombination[index] = arr[i];
            generateCombination(i + 1, index + 1, currentCombination);
        }
    }

    generateCombination(0, 0, new Array(r));
    return combinations;
}

export const getCalculation = (req) => {
    const {_includeDecimals, _numbers, _target, approxMode } = req;


    try {
        const includeDecimals = _includeDecimals;
        let numbers = (_numbers || []).filter(num => num !== null);
        let target = _target;

        if (!numbers || target === undefined) {
            throw new Error("Missing numbers or target in the request");
        }

        numbers = numbers.map(num => parseFloat(num));
        target = parseFloat(target);

        if (!includeDecimals) {
            numbers = numbers.map(num => Math.round(num));
            target = Math.round(target);
        }

        let subsets = find_subsets(numbers, target);

        if (!subsets.length && approxMode) {
            subsets = find_approximate_subsets(numbers, target);
        }

        // res.json(subsets);
        console.log("Daddddd", subsets);
        return subsets
    } catch (e) {
        console.error("Error in calculation:", e);
        // res.status(500).json({ error: e.toString() });
    }
};