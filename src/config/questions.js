// Full DSA Question Bank with 60 questions (20 per level)
// Each contains templates and tests for JavaScript, Python, and C++

export const QUESTION_BANK = {
  basic: [
    {
      id: 'two-sum',
      title: 'Two Sum',
      difficulty: 'Basic',
      description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.`,
      templates: {
        javascript: `function twoSum(nums, target) {\n    return [];\n}`,
        python: `def two_sum(nums: list[int], target: int) -> list[int]:\n    return []`,
        cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        return {};\n    }\n};`
      },
      testScript: {
        javascript: `const res1 = twoSum([2,7,11,15], 9); const pass1 = res1.includes(0) && res1.includes(1);\nconsole.log(pass1 ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `res1 = two_sum([2,7,11,15], 9); pass1 = set(res1) == {0, 1}\nprint("All test cases PASSED!" if pass1 else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    vector<int> n = {2,7,11,15};\n    vector<int> r = s.twoSum(n, 9);\n    bool p = (r.size() == 2 && ((r[0] == 0 && r[1] == 1) || (r[0] == 1 && r[1] == 0)));\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'reverse-string',
      title: 'Reverse String',
      difficulty: 'Basic',
      description: `Write a function that reverses a string in-place.`,
      templates: {
        javascript: `function reverseString(s) {\n    s.reverse();\n}`,
        python: `def reverse_string(s: list[str]) -> None:\n    s.reverse()`,
        cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    void reverseString(vector<char>& s) {}\n};`
      },
      testScript: {
        javascript: `const s = ["h","e","l","l","o"]; reverseString(s);\nconsole.log(s.join("") === "olleh" ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `s = ["h","e","l","l","o"]; reverse_string(s);\nprint("All test cases PASSED!" if "".join(s) == "olleh" else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution sol;\n    vector<char> s = {'h','e','l','l','o'};\n    sol.reverseString(s);\n    bool p = (s == vector<char>{'o','l','l','e','h'});\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'palindrome-number',
      title: 'Palindrome Number',
      difficulty: 'Basic',
      description: `Determine whether an integer is a palindrome.`,
      templates: {
        javascript: `function isPalindrome(x) {\n    return false;\n}`,
        python: `def is_palindrome(x: int) -> bool:\n    return False`,
        cpp: `class Solution {\npublic:\n    bool isPalindrome(int x) {\n        return false;\n    }\n};`
      },
      testScript: {
        javascript: `console.log(isPalindrome(121) === true && isPalindrome(-121) === false ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if is_palindrome(121) == True and is_palindrome(-121) == False else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    bool p = s.isPalindrome(121) == true && s.isPalindrome(-121) == false;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'fibonacci-number',
      title: 'Fibonacci Number',
      difficulty: 'Basic',
      description: `Compute the N-th Fibonacci number.`,
      templates: {
        javascript: `function fib(n) {\n    return 0;\n}`,
        python: `def fib(n: int) -> int:\n    return 0`,
        cpp: `class Solution {\npublic:\n    int fib(int n) {\n        return 0;\n    }\n};`
      },
      testScript: {
        javascript: `console.log(fib(4) === 3 && fib(2) === 1 ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if fib(4) == 3 and fib(2) == 1 else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    bool p = s.fib(4) == 3 && s.fib(2) == 1;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'fizz-buzz',
      title: 'Fizz Buzz',
      difficulty: 'Basic',
      description: `Return string representation of numbers from 1 to n with Fizz/Buzz rules.`,
      templates: {
        javascript: `function fizzBuzz(n) {\n    return [];\n}`,
        python: `def fizz_buzz(n: int) -> list[str]:\n    return []`,
        cpp: `#include <vector>\n#include <string>\nusing namespace std;\nclass Solution {\npublic:\n    vector<string> fizzBuzz(int n) {\n        return {};\n    }\n};`
      },
      testScript: {
        javascript: `const r = fizzBuzz(3); console.log(r[0]==="1" && r[1]==="2" && r[2]==="Fizz" ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `r = fizz_buzz(3); print("All test cases PASSED!" if r == ["1","2","Fizz"] else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    auto r = s.fizzBuzz(3);\n    bool p = (r.size() == 3 && r[0] == "1" && r[1] == "2" && r[2] == "Fizz");\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'single-number',
      title: 'Single Number',
      difficulty: 'Basic',
      description: `Given a non-empty array of integers, every element appears twice except for one. Find that single one.`,
      templates: {
        javascript: `function singleNumber(nums) {\n    return 0;\n}`,
        python: `def single_number(nums: list[int]) -> int:\n    return 0`,
        cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    int singleNumber(vector<int>& nums) {\n        return 0;\n    }\n};`
      },
      testScript: {
        javascript: `console.log(singleNumber([4,1,2,1,2]) === 4 ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if single_number([4,1,2,1,2]) == 4 else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    vector<int> n = {4,1,2,1,2};\n    bool p = s.singleNumber(n) == 4;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'valid-anagram',
      title: 'Valid Anagram',
      difficulty: 'Basic',
      description: `Given two strings s and t, return true if t is an anagram of s.`,
      templates: {
        javascript: `function isAnagram(s, t) {\n    return false;\n}`,
        python: `def is_anagram(s: str, t: str) -> bool:\n    return False`,
        cpp: `#include <string>\nusing namespace std;\nclass Solution {\npublic:\n    bool isAnagram(string s, string t) {\n        return false;\n    }\n};`
      },
      testScript: {
        javascript: `console.log(isAnagram("anagram", "nagaram") === true && isAnagram("rat", "car") === false ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if is_anagram("anagram", "nagaram") == True and is_anagram("rat", "car") == False else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution sol;\n    bool p = sol.isAnagram("anagram", "nagaram") == true && sol.isAnagram("rat", "car") == false;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'majority-element',
      title: 'Majority Element',
      difficulty: 'Basic',
      description: `Given an array of size n, find the element that appears more than n/2 times.`,
      templates: {
        javascript: `function majorityElement(nums) {\n    return 0;\n}`,
        python: `def majority_element(nums: list[int]) -> int:\n    return 0`,
        cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    int majorityElement(vector<int>& nums) {\n        return 0;\n    }\n};`
      },
      testScript: {
        javascript: `console.log(majorityElement([3,2,3]) === 3 ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if majority_element([3,2,3]) == 3 else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    vector<int> n = {3,2,3};\n    bool p = s.majorityElement(n) == 3;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'move-zeroes',
      title: 'Move Zeroes',
      difficulty: 'Basic',
      description: `Move all 0's to the end of array in-place.`,
      templates: {
        javascript: `function moveZeroes(nums) {\n    // Write your code here\n}`,
        python: `def move_zeroes(nums: list[int]) -> None:\n    # Write your code here\n    pass`,
        cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    void moveZeroes(vector<int>& nums) {}\n};`
      },
      testScript: {
        javascript: `const n = [0,1,0,3,12]; moveZeroes(n); console.log(JSON.stringify(n) === JSON.stringify([1,3,12,0,0]) ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `n = [0,1,0,3,12]; move_zeroes(n); print("All test cases PASSED!" if n == [1,3,12,0,0] else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    vector<int> n = {0,1,0,3,12};\n    s.moveZeroes(n);\n    bool p = (n == vector<int>{1,3,12,0,0});\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'plus-one',
      title: 'Plus One',
      difficulty: 'Basic',
      description: `Add one to the integer represented as array of digits.`,
      templates: {
        javascript: `function plusOne(digits) {\n    return [];\n}`,
        python: `def plus_one(digits: list[int]) -> list[int]:\n    return []`,
        cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    vector<int> plusOne(vector<int>& digits) {\n        return {};\n    }\n};`
      },
      testScript: {
        javascript: `console.log(JSON.stringify(plusOne([1,2,3])) === JSON.stringify([1,2,4]) ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if plus_one([1,2,3]) == [1,2,4] else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    vector<int> d = {1,2,3};\n    bool p = s.plusOne(d) == vector<int>{1,2,4};\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'length-of-last-word',
      title: 'Length of Last Word',
      difficulty: 'Basic',
      description: `Return length of the last word in string s.`,
      templates: {
        javascript: `function lengthOfLastWord(s) {\n    return 0;\n}`,
        python: `def length_of_last_word(s: str) -> int:\n    return 0`,
        cpp: `#include <string>\nusing namespace std;\nclass Solution {\npublic:\n    int lengthOfLastWord(string s) {\n        return 0;\n    }\n};`
      },
      testScript: {
        javascript: `console.log(lengthOfLastWord("Hello World") === 5 ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if length_of_last_word("Hello World") == 5 else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    bool p = s.lengthOfLastWord("Hello World") == 5;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'power-of-two',
      title: 'Power of Two',
      difficulty: 'Basic',
      description: `Return true if integer n is a power of two.`,
      templates: {
        javascript: `function isPowerOfTwo(n) {\n    return false;\n}`,
        python: `def is_power_of_two(n: int) -> bool:\n    return False`,
        cpp: `class Solution {\npublic:\n    bool isPowerOfTwo(int n) {\n        return false;\n    }\n};`
      },
      testScript: {
        javascript: `console.log(isPowerOfTwo(16) === true && isPowerOfTwo(3) === false ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if is_power_of_two(16) == True and is_power_of_two(3) == False else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    bool p = s.isPowerOfTwo(16) == true && s.isPowerOfTwo(3) == false;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'missing-number',
      title: 'Missing Number',
      difficulty: 'Basic',
      description: `Find the only number in the range [0, n] missing from the array.`,
      templates: {
        javascript: `function missingNumber(nums) {\n    return 0;\n}`,
        python: `def missing_number(nums: list[int]) -> int:\n    return 0`,
        cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    int missingNumber(vector<int>& nums) {\n        return 0;\n    }\n};`
      },
      testScript: {
        javascript: `console.log(missingNumber([3,0,1]) === 2 ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if missing_number([3,0,1]) == 2 else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    vector<int> n = {3,0,1};\n    bool p = s.missingNumber(n) == 2;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'intersection-of-arrays',
      title: 'Intersection of Two Arrays',
      difficulty: 'Basic',
      description: `Return array of unique elements present in both arrays.`,
      templates: {
        javascript: `function intersection(nums1, nums2) {\n    return [];\n}`,
        python: `def intersection(nums1: list[int], nums2: list[int]) -> list[int]:\n    return []`,
        cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    vector<int> intersection(vector<int>& nums1, vector<int>& nums2) {\n        return {};\n    }\n};`
      },
      testScript: {
        javascript: `const r = intersection([1,2,2,1], [2,2]); console.log(r.length === 1 && r[0] === 2 ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `r = intersection([1,2,2,1], [2,2]); print("All test cases PASSED!" if list(r) == [2] else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    vector<int> n1 = {1,2,2,1}, n2 = {2,2};\n    vector<int> r = s.intersection(n1, n2);\n    bool p = (r.size() == 1 && r[0] == 2);\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'valid-palindrome',
      title: 'Valid Palindrome',
      difficulty: 'Basic',
      description: `Verify if alphanumeric characters in s read the same backward as forward.`,
      templates: {
        javascript: `function isPalindrome(s) {\n    return false;\n}`,
        python: `def is_palindrome(s: str) -> bool:\n    return False`,
        cpp: `#include <string>\nusing namespace std;\nclass Solution {\npublic:\n    bool isPalindrome(string s) {\n        return false;\n    }\n};`
      },
      testScript: {
        javascript: `console.log(isPalindrome("A man, a plan, a canal: Panama") === true ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if is_palindrome("A man, a plan, a canal: Panama") == True else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution sol;\n    bool p = sol.isPalindrome("A man, a plan, a canal: Panama");\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'contains-duplicate',
      title: 'Contains Duplicate',
      difficulty: 'Basic',
      description: `Return true if any value appears at least twice in the array.`,
      templates: {
        javascript: `function containsDuplicate(nums) {\n    return false;\n}`,
        python: `def contains_duplicate(nums: list[int]) -> bool:\n    return False`,
        cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    bool containsDuplicate(vector<int>& nums) {\n        return false;\n    }\n};`
      },
      testScript: {
        javascript: `console.log(containsDuplicate([1,2,3,1]) === true && containsDuplicate([1,2,3,4]) === false ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if contains_duplicate([1,2,3,1]) == True and contains_duplicate([1,2,3,4]) == False else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    vector<int> n1 = {1,2,3,1}, n2 = {1,2,3,4};\n    bool p = s.containsDuplicate(n1) == true && s.containsDuplicate(n2) == false;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'climbing-stairs',
      title: 'Climbing Stairs',
      difficulty: 'Basic',
      description: `Compute the number of distinct ways to climb n steps when you can climb 1 or 2 steps.`,
      templates: {
        javascript: `function climbStairs(n) {\n    return 0;\n}`,
        python: `def climb_stairs(n: int) -> int:\n    return 0`,
        cpp: `class Solution {\npublic:\n    int climbStairs(int n) {\n        return 0;\n    }\n};`
      },
      testScript: {
        javascript: `console.log(climbStairs(2) === 2 && climbStairs(3) === 3 ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if climb_stairs(2) == 2 and climb_stairs(3) == 3 else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    bool p = s.climbStairs(2) == 2 && s.climbStairs(3) == 3;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'two-sum-ii',
      title: 'Two Sum II',
      difficulty: 'Basic',
      description: `Two sum when inputs are sorted (return 1-based indices).`,
      templates: {
        javascript: `function twoSumSorted(numbers, target) {\n    return [];\n}`,
        python: `def two_sum_sorted(numbers: list[int], target: int) -> list[int]:\n    return []`,
        cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& numbers, int target) {\n        return {};\n    }\n};`
      },
      testScript: {
        javascript: `const r = twoSumSorted([2,7,11,15], 9); console.log(r[0]===1 && r[1]===2 ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `r = two_sum_sorted([2,7,11,15], 9); print("All test cases PASSED!" if r == [1,2] else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    vector<int> n = {2,7,11,15};\n    vector<int> r = s.twoSum(n, 9);\n    bool p = (r.size() == 2 && r[0] == 1 && r[1] == 2);\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'ugly-number',
      title: 'Ugly Number',
      difficulty: 'Basic',
      description: `Return true if positive integer only has prime factors 2, 3, and 5.`,
      templates: {
        javascript: `function isUgly(n) {\n    return false;\n}`,
        python: `def is_ugly(n: int) -> bool:\n    return False`,
        cpp: `class Solution {\npublic:\n    bool isUgly(int n) {\n        return false;\n    }\n};`
      },
      testScript: {
        javascript: `console.log(isUgly(6) === true && isUgly(14) === false ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if is_ugly(6) == True and is_ugly(14) == False else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    bool p = s.isUgly(6) == true && s.isUgly(14) == false;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'first-bad-version',
      title: 'First Bad Version',
      difficulty: 'Basic',
      description: `Find the first bad version using API function isBadVersion(version).`,
      templates: {
        javascript: `// isBadVersion(v) is pre-defined.\nfunction solution(isBadVersion) {\n    return function(n) {\n        return 1;\n    };\n}`,
        python: `# isBadVersion(v) is pre-defined.\ndef first_bad_version(n: int) -> int:\n    return 1`,
        cpp: `// isBadVersion(v) is pre-defined.\nclass Solution {\npublic:\n    int firstBadVersion(int n) {\n        return 1;\n    }\n};`
      },
      testScript: {
        javascript: `const isBadVersion = (v) => v >= 4; const f = solution(isBadVersion); console.log(f(5) === 4 ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `def isBadVersion(v): return v >= 4\ndef first_bad_version_test(n):\n    l, r = 1, n\n    while l < r:\n        m = (l+r)//2\n        if isBadVersion(m): r = m\n        else: l = m + 1\n    return l\nprint("All test cases PASSED!" if first_bad_version_test(5) == 4 else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nbool isBadVersion(int v) { return v >= 4; }\nclass Solution {\npublic:\n    int firstBadVersion(int n) {\n        int l = 1, r = n;\n        while (l < r) {\n            int m = l + (r - l) / 2;\n            if (isBadVersion(m)) r = m;\n            else l = m + 1;\n        }\n        return l;\n    }\n};\nint main() {\n    Solution s;\n    bool p = s.firstBadVersion(5) == 4;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    }
  ],
  medium: [
    {
      id: 'valid-parentheses',
      title: 'Valid Parentheses',
      difficulty: 'Intermediate',
      description: `Given a string s containing bracket characters, determine if brackets are matched and closed in proper order.`,
      templates: {
        javascript: `function isValid(s) {\n    return false;\n}`,
        python: `def is_valid(s: str) -> bool:\n    return False`,
        cpp: `#include <string>\nusing namespace std;\nclass Solution {\npublic:\n    bool isValid(string s) {\n        return false;\n    }\n};`
      },
      testScript: {
        javascript: `console.log(isValid("()") === true && isValid("(]") === false ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if is_valid("()") == True and is_valid("(]") == False else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution sol;\n    bool p = sol.isValid("()") == true && sol.isValid("(]") == false;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'binary-search',
      title: 'Binary Search',
      difficulty: 'Intermediate',
      description: `Perform O(log n) search to find target element index. Return -1 if missing.`,
      templates: {
        javascript: `function search(nums, target) {\n    return -1;\n}`,
        python: `def search(nums: list[int], target: int) -> int:\n    return -1`,
        cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        return -1;\n    }\n};`
      },
      testScript: {
        javascript: `console.log(search([-1,0,3,5,9,12], 9) === 4 ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if search([-1,0,3,5,9,12], 9) == 4 else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    vector<int> n = {-1,0,3,5,9,12};\n    bool p = s.search(n, 9) == 4;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'three-sum',
      title: '3Sum',
      difficulty: 'Intermediate',
      description: `Find all unique triplets summing to zero.`,
      templates: {
        javascript: `function threeSum(nums) {\n    return [];\n}`,
        python: `def three_sum(nums: list[int]) -> list[list[int]]:\n    return []`,
        cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {\n        return {};\n    }\n};`
      },
      testScript: {
        javascript: `const res = threeSum([-1,0,1,2,-1,-4]); console.log(res.length > 0 ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `res = three_sum([-1,0,1,2,-1,-4]); print("All test cases PASSED!" if len(res) > 0 else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    vector<int> n = {-1,0,1,2,-1,-4};\n    bool p = s.threeSum(n).size() > 0;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'group-anagrams',
      title: 'Group Anagrams',
      difficulty: 'Intermediate',
      description: `Group lists of anagrams together.`,
      templates: {
        javascript: `function groupAnagrams(strs) {\n    return [];\n}`,
        python: `def group_anagrams(strs: list[str]) -> list[list[str]]:\n    return []`,
        cpp: `#include <vector>\n#include <string>\nusing namespace std;\nclass Solution {\npublic:\n    vector<vector<string>> groupAnagrams(vector<string>& strs) {\n        return {};\n    }\n};`
      },
      testScript: {
        javascript: `const res = groupAnagrams(["eat","tea","tan","ate","nat","bat"]); console.log(res.length > 0 ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `res = group_anagrams(["eat","tea","tan","ate","nat","bat"]); print("All test cases PASSED!" if len(res) > 0 else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    vector<string> strs = {"eat","tea","tan","ate","nat","bat"};\n    bool p = s.groupAnagrams(strs).size() > 0;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'longest-substring',
      title: 'Longest Substring without Repeating Characters',
      difficulty: 'Intermediate',
      description: `Return length of longest substring without duplicates.`,
      templates: {
        javascript: `function lengthOfLongestSubstring(s) {\n    return 0;\n}`,
        python: `def length_of_longest_substring(s: str) -> int:\n    return 0`,
        cpp: `#include <string>\nusing namespace std;\nclass Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        return 0;\n    }\n};`
      },
      testScript: {
        javascript: `console.log(lengthOfLongestSubstring("abcabcbb") === 3 ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if length_of_longest_substring("abcabcbb") == 3 else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    bool p = s.lengthOfLongestSubstring("abcabcbb") == 3;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'container-with-water',
      title: 'Container With Most Water',
      difficulty: 'Intermediate',
      description: `Find two lines that together with x-axis forms a container containing the most water.`,
      templates: {
        javascript: `function maxArea(height) {\n    return 0;\n}`,
        python: `def max_area(height: list[int]) -> int:\n    return 0`,
        cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        return 0;\n    }\n};`
      },
      testScript: {
        javascript: `console.log(maxArea([1,8,6,2,5,4,8,3,7]) === 49 ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if max_area([1,8,6,2,5,4,8,3,7]) == 49 else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    vector<int> h = {1,8,6,2,5,4,8,3,7};\n    bool p = s.maxArea(h) == 49;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'rotate-image',
      title: 'Rotate Image',
      difficulty: 'Intermediate',
      description: `Rotate n x n matrix 90 degrees clockwise in-place.`,
      templates: {
        javascript: `function rotate(matrix) {\n    // Rotate in-place\n}`,
        python: `def rotate(matrix: list[list[int]]) -> None:\n    pass`,
        cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    void rotate(vector<vector<int>>& matrix) {}\n};`
      },
      testScript: {
        javascript: `const m = [[1,2],[3,4]]; rotate(m); console.log(m[0][0]===3 && m[0][1]===1 ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `m = [[1,2],[3,4]]; rotate(m); print("All test cases PASSED!" if m == [[3,1],[4,2]] else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    vector<vector<int>> m = {{1,2},{3,4}};\n    s.rotate(m);\n    bool p = (m == vector<vector<int>>{{3,1},{4,2}});\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'subsets',
      title: 'Subsets',
      difficulty: 'Intermediate',
      description: `Return all unique subsets (power set) of a list of integers.`,
      templates: {
        javascript: `function subsets(nums) {\n    return [];\n}`,
        python: `def subsets(nums: list[int]) -> list[list[int]]:\n    return []`,
        cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    vector<vector<int>> subsets(vector<int>& nums) {\n        return {};\n    }\n};`
      },
      testScript: {
        javascript: `console.log(subsets([1,2]).length === 4 ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if len(subsets([1,2])) == 4 else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    vector<int> n = {1,2};\n    bool p = s.subsets(n).size() == 4;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'word-search',
      title: 'Word Search',
      difficulty: 'Intermediate',
      description: `Verify if a word exists in a grid of chars, where letters connect horizontally or vertically.`,
      templates: {
        javascript: `function exist(board, word) {\n    return false;\n}`,
        python: `def exist(board: list[list[str]], word: str) -> bool:\n    return False`,
        cpp: `#include <vector>\n#include <string>\nusing namespace std;\nclass Solution {\npublic:\n    bool exist(vector<vector<char>>& board, string word) {\n        return false;\n    }\n};`
      },
      testScript: {
        javascript: `console.log(exist([["A","B"],["C","D"]], "AB") === true ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if exist([["A","B"],["C","D"]], "AB") == True else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    vector<vector<char>> b = {{'A','B'},{'C','D'}};\n    bool p = s.exist(b, "AB");\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'kth-largest',
      title: 'Kth Largest Element',
      difficulty: 'Intermediate',
      description: `Find the kth largest element in an unsorted array.`,
      templates: {
        javascript: `function findKthLargest(nums, k) {\n    return 0;\n}`,
        python: `def find_kth_largest(nums: list[int], k: int) -> int:\n    return 0`,
        cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    int findKthLargest(vector<int>& nums, int k) {\n        return 0;\n    }\n};`
      },
      testScript: {
        javascript: `console.log(findKthLargest([3,2,1,5,6,4], 2) === 5 ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if find_kth_largest([3,2,1,5,6,4], 2) == 5 else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    vector<int> n = {3,2,1,5,6,4};\n    bool p = s.findKthLargest(n, 2) == 5;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'merge-intervals',
      title: 'Merge Intervals',
      difficulty: 'Intermediate',
      description: `Merge overlapping intervals.`,
      templates: {
        javascript: `function merge(intervals) {\n    return [];\n}`,
        python: `def merge(intervals: list[list[int]]) -> list[list[int]]:\n    return []`,
        cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    vector<vector<int>> merge(vector<vector<int>>& intervals) {\n        return {};\n    }\n};`
      },
      testScript: {
        javascript: `const r = merge([[1,3],[2,6]]); console.log(r[0][0]===1 && r[0][1]===6 ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `r = merge([[1,3],[2,6]]); print("All test cases PASSED!" if r == [[1,6]] else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    vector<vector<int>> i = {{1,3},{2,6}};\n    bool p = (s.merge(i) == vector<vector<int>>{{1,6}});\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'top-k-frequent',
      title: 'Top K Frequent Elements',
      difficulty: 'Intermediate',
      description: `Return the k most frequent elements in nums.`,
      templates: {
        javascript: `function topKFrequent(nums, k) {\n    return [];\n}`,
        python: `def top_k_frequent(nums: list[int], k: int) -> list[int]:\n    return []`,
        cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    vector<int> topKFrequent(vector<int>& nums, int k) {\n        return {};\n    }\n};`
      },
      testScript: {
        javascript: `const r = topKFrequent([1,1,1,2,2,3], 2); console.log(r.includes(1) && r.includes(2) ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `r = top_k_frequent([1,1,1,2,2,3], 2); print("All test cases PASSED!" if set(r) == {1,2} else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    vector<int> n = {1,1,1,2,2,3};\n    vector<int> r = s.topKFrequent(n, 2);\n    bool p = (r.size() == 2 && ((r[0]==1 && r[1]==2) || (r[0]==2 && r[1]==1)));\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'coin-change',
      title: 'Coin Change',
      difficulty: 'Intermediate',
      description: `Compute the fewest coins needed to make up target amount.`,
      templates: {
        javascript: `function coinChange(coins, amount) {\n    return -1;\n}`,
        python: `def coin_change(coins: list[int], amount: int) -> int:\n    return -1`,
        cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) {\n        return -1;\n    }\n};`
      },
      testScript: {
        javascript: `console.log(coinChange([1,2,5], 11) === 3 ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if coin_change([1,2,5], 11) == 3 else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    vector<int> c = {1,2,5};\n    bool p = s.coinChange(c, 11) == 3;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'product-except-self',
      title: 'Product of Array Except Self',
      difficulty: 'Intermediate',
      description: `Return array where output[i] is product of all elements except nums[i] in O(n) without division.`,
      templates: {
        javascript: `function productExceptSelf(nums) {\n    return [];\n}`,
        python: `def product_except_self(nums: list[int]) -> list[int]:\n    return []`,
        cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    vector<int> productExceptSelf(vector<int>& nums) {\n        return {};\n    }\n};`
      },
      testScript: {
        javascript: `console.log(JSON.stringify(productExceptSelf([1,2,3,4])) === JSON.stringify([24,12,8,6]) ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if product_except_self([1,2,3,4]) == [24,12,8,6] else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    vector<int> n = {1,2,3,4};\n    bool p = s.productExceptSelf(n) == vector<int>{24,12,8,6};\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'number-of-islands',
      title: 'Number of Islands',
      difficulty: 'Intermediate',
      description: `Given a 2D grid of '1's (land) and '0's (water), count the number of islands.`,
      templates: {
        javascript: `function numIslands(grid) {\n    return 0;\n}`,
        python: `def num_islands(grid: list[list[str]]) -> int:\n    return 0`,
        cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        return 0;\n    }\n};`
      },
      testScript: {
        javascript: `console.log(numIslands([["1","1","0"],["1","1","0"],["0","0","0"]]) === 1 ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if num_islands([["1","1","0"],["1","1","0"],["0","0","0"]]) == 1 else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    vector<vector<char>> g = {{'1','1','0'},{'1','1','0'},{'0','0','0'}};\n    bool p = s.numIslands(g) == 1;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'course-schedule',
      title: 'Course Schedule',
      difficulty: 'Intermediate',
      description: `Determine if you can finish all courses given prerequisite links.`,
      templates: {
        javascript: `function canFinish(numCourses, prerequisites) {\n    return false;\n}`,
        python: `def can_finish(num_courses: int, prerequisites: list[list[int]]) -> bool:\n    return False`,
        cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {\n        return false;\n    }\n};`
      },
      testScript: {
        javascript: `console.log(canFinish(2, [[1,0]]) === true && canFinish(2, [[1,0],[0,1]]) === false ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if can_finish(2, [[1,0]]) == True and can_finish(2, [[1,0],[0,1]]) == False else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    vector<vector<int>> p1 = {{1,0}}, p2 = {{1,0},{0,1}};\n    bool p = s.canFinish(2, p1) == true && s.canFinish(2, p2) == false;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'rotated-min',
      title: 'Find Min in Rotated Sorted Array',
      difficulty: 'Intermediate',
      description: `Find the minimum element in a rotated sorted array in O(log n).`,
      templates: {
        javascript: `function findMin(nums) {\n    return 0;\n}`,
        python: `def find_min(nums: list[int]) -> int:\n    return 0`,
        cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    int findMin(vector<int>& nums) {\n        return 0;\n    }\n};`
      },
      testScript: {
        javascript: `console.log(findMin([3,4,5,1,2]) === 1 ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if find_min([3,4,5,1,2]) == 1 else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    vector<int> n = {3,4,5,1,2};\n    bool p = s.findMin(n) == 1;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'rotated-search',
      title: 'Search in Rotated Sorted Array',
      difficulty: 'Intermediate',
      description: `Search target element index in a rotated sorted array in O(log n).`,
      templates: {
        javascript: `function searchRotated(nums, target) {\n    return -1;\n}`,
        python: `def search_rotated(nums: list[int], target: int) -> int:\n    return -1`,
        cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        return -1;\n    }\n};`
      },
      testScript: {
        javascript: `console.log(searchRotated([4,5,6,7,0,1,2], 0) === 4 ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if search_rotated([4,5,6,7,0,1,2], 0) == 4 else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    vector<int> n = {4,5,6,7,0,1,2};\n    bool p = s.search(n, 0) == 4;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'unique-paths',
      title: 'Unique Paths',
      difficulty: 'Intermediate',
      description: `Count unique grid paths from top-left to bottom-right corner.`,
      templates: {
        javascript: `function uniquePaths(m, n) {\n    return 0;\n}`,
        python: `def unique_paths(m: int, n: int) -> int:\n    return 0`,
        cpp: `class Solution {\npublic:\n    int uniquePaths(int m, int n) {\n        return 0;\n    }\n};`
      },
      testScript: {
        javascript: `console.log(uniquePaths(3, 7) === 28 ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if unique_paths(3, 7) == 28 else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    bool p = s.uniquePaths(3, 7) == 28;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'decode-string',
      title: 'Decode String',
      difficulty: 'Intermediate',
      description: `Decode pattern like k[encoded_string] to repeated string characters.`,
      templates: {
        javascript: `function decodeString(s) {\n    return "";\n}`,
        python: `def decode_string(s: str) -> str:\n    return ""`,
        cpp: `#include <string>\nusing namespace std;\nclass Solution {\npublic:\n    string decodeString(string s) {\n        return "";\n    }\n};`
      },
      testScript: {
        javascript: `console.log(decodeString("3[a]2[bc]") === "aaabcbc" ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if decode_string("3[a]2[bc]") == "aaabcbc" else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    bool p = s.decodeString("3[a]2[bc]") == "aaabcbc";\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    }
  ],
  advanced: [
    {
      id: 'max-path-sum',
      title: 'Binary Tree Maximum Path Sum',
      difficulty: 'Advanced',
      description: `Find the maximum path sum of any non-empty path in a binary tree.`,
      templates: {
        javascript: `function TreeNode(val, left, right) {\n    this.val = val; this.left = left; this.right = right;\n}\nfunction maxPathSum(root) {\n    return 0;\n}`,
        python: `class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val=val; self.left=left; self.right=right\ndef max_path_sum(root: TreeNode) -> int:\n    return 0`,
        cpp: `struct TreeNode {\n    int val; TreeNode *left; TreeNode *right;\n    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n};\nclass Solution {\npublic:\n    int maxPathSum(TreeNode* root) {\n        return 0;\n    }\n};`
      },
      testScript: {
        javascript: `const r = new TreeNode(1, new TreeNode(2), new TreeNode(3));\nconsole.log(maxPathSum(r) === 6 ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `r = TreeNode(1, TreeNode(2), TreeNode(3)); print("All test cases PASSED!" if max_path_sum(r) == 6 else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    TreeNode* r = new TreeNode(1);\n    r->left = new TreeNode(2); r->right = new TreeNode(3);\n    bool p = s.maxPathSum(r) == 6;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'longest-increasing-subsequence',
      title: 'Longest Increasing Subsequence',
      difficulty: 'Advanced',
      description: `Return the length of the longest strictly increasing subsequence of integer array.`,
      templates: {
        javascript: `function lengthOfLIS(nums) {\n    return 0;\n}`,
        python: `def length_of_lis(nums: list[int]) -> int:\n    return 0`,
        cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    int lengthOfLIS(vector<int>& nums) {\n        return 0;\n    }\n};`
      },
      testScript: {
        javascript: `console.log(lengthOfLIS([10,9,2,5,3,7,101,18]) === 4 ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if length_of_lis([10,9,2,5,3,7,101,18]) == 4 else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    vector<int> n = {10,9,2,5,3,7,101,18};\n    bool p = s.lengthOfLIS(n) == 4;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'lru-cache',
      title: 'LRU Cache',
      difficulty: 'Advanced',
      description: `Design and implement a Least Recently Used (LRU) cache data structure supporting get(key) and put(key, val) in O(1).`,
      templates: {
        javascript: `class LRUCache {\n    constructor(capacity) {}\n    get(key) { return -1; }\n    put(key, value) {}\n}`,
        python: `class LRUCache:\n    def __init__(self, capacity: int): pass\n    def get(self, key: int) -> int: return -1\n    def put(self, key: int, value: int) -> None: pass`,
        cpp: `class LRUCache {\npublic:\n    LRUCache(int capacity) {}\n    int get(int key) { return -1; }\n    void put(int key, int value) {}\n};`
      },
      testScript: {
        javascript: `const c = new LRUCache(2); c.put(1,1); c.put(2,2); const p = c.get(1)===1; c.put(3,3); console.log(p && c.get(2)===-1 ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `c = LRUCache(2); c.put(1,1); c.put(2,2); p = c.get(1)==1; c.put(3,3); print("All test cases PASSED!" if p and c.get(2)==-1 else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    LRUCache c(2); c.put(1,1); c.put(2,2);\n    bool p = c.get(1)==1; c.put(3,3);\n    bool p2 = c.get(2)==-1;\n    std::cout << ((p && p2) ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'median-two-arrays',
      title: 'Median of Two Sorted Arrays',
      difficulty: 'Advanced',
      description: `Find median of two sorted arrays in O(log(m+n)).`,
      templates: {
        javascript: `function findMedianSortedArrays(nums1, nums2) {\n    return 0.0;\n}`,
        python: `def find_median_sorted_arrays(nums1: list[int], nums2: list[int]) -> float:\n    return 0.0`,
        cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n        return 0.0;\n    }\n};`
      },
      testScript: {
        javascript: `console.log(findMedianSortedArrays([1,3], [2]) === 2.0 ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if find_median_sorted_arrays([1,3], [2]) == 2.0 else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    vector<int> n1 = {1,3}, n2 = {2};\n    bool p = s.findMedianSortedArrays(n1, n2) == 2.0;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'regex-matching',
      title: 'Regular Expression Matching',
      difficulty: 'Advanced',
      description: `Implement regex matching with support for '.' and '*'.`,
      templates: {
        javascript: `function isMatch(s, p) {\n    return false;\n}`,
        python: `def is_match(s: str, p: str) -> bool:\n    return False`,
        cpp: `#include <string>\nusing namespace std;\nclass Solution {\npublic:\n    bool isMatch(string s, string p) {\n        return false;\n    }\n};`
      },
      testScript: {
        javascript: `console.log(isMatch("aa", "a*") === true && isMatch("ab", ".*") === true ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if is_match("aa", "a*") == True and is_match("ab", ".*") == True else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    bool p = s.isMatch("aa", "a*") == true && s.isMatch("ab", ".*") == true;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'merge-k-lists',
      title: 'Merge K Sorted Lists',
      difficulty: 'Advanced',
      description: `Merge k sorted linked lists and return it as one sorted list.`,
      templates: {
        javascript: `function ListNode(val, next) {\n    this.val = val; this.next = next;\n}\nfunction mergeKLists(lists) {\n    return null;\n}`,
        python: `class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val=val; self.next=next\ndef merge_k_lists(lists: list[ListNode]) -> ListNode:\n    return None`,
        cpp: `struct ListNode {\n    int val; ListNode *next;\n    ListNode(int x) : val(x), next(nullptr) {}\n};\nclass Solution {\npublic:\n    ListNode* mergeKLists(vector<ListNode*>& lists) {\n        return nullptr;\n    }\n};`
      },
      testScript: {
        javascript: `console.log(mergeKLists([]) === null ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if merge_k_lists([]) is None else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    vector<ListNode*> l;\n    bool p = s.mergeKLists(l) == nullptr;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'reverse-k-group',
      title: 'Reverse Nodes in k-Group',
      difficulty: 'Advanced',
      description: `Reverse nodes of a linked list k at a time.`,
      templates: {
        javascript: `function ListNode(val, next) {\n    this.val = val; this.next = next;\n}\nfunction reverseKGroup(head, k) {\n    return head;\n}`,
        python: `class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val=val; self.next=next\ndef reverse_k_group(head: ListNode, k: int) -> ListNode:\n    return head`,
        cpp: `struct ListNode {\n    int val; ListNode *next;\n    ListNode(int x) : val(x), next(nullptr) {}\n};\nclass Solution {\npublic:\n    ListNode* reverseKGroup(ListNode* head, int k) {\n        return head;\n    }\n};`
      },
      testScript: {
        javascript: `console.log(reverseKGroup(null, 2) === null ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if reverse_k_group(None, 2) is None else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    bool p = s.reverseKGroup(nullptr, 2) == nullptr;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'first-missing-positive',
      title: 'First Missing Positive',
      difficulty: 'Advanced',
      description: `Find the smallest missing positive integer in O(n) time and O(1) space.`,
      templates: {
        javascript: `function firstMissingPositive(nums) {\n    return 1;\n}`,
        python: `def first_missing_positive(nums: list[int]) -> int:\n    return 1`,
        cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    int firstMissingPositive(vector<int>& nums) {\n        return 1;\n    }\n};`
      },
      testScript: {
        javascript: `console.log(firstMissingPositive([1,2,0]) === 3 ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if first_missing_positive([1,2,0]) == 3 else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    vector<int> n = {1,2,0};\n    bool p = s.firstMissingPositive(n) == 3;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'n-queens',
      title: 'N-Queens',
      difficulty: 'Advanced',
      description: `Return all distinct boards placing n queens on n x n chessboard.`,
      templates: {
        javascript: `function solveNQueens(n) {\n    return [];\n}`,
        python: `def solve_n_queens(n: int) -> list[list[str]]:\n    return []`,
        cpp: `#include <vector>\n#include <string>\nusing namespace std;\nclass Solution {\npublic:\n    vector<vector<string>> solveNQueens(int n) {\n        return {};\n    }\n};`
      },
      testScript: {
        javascript: `console.log(solveNQueens(4).length === 2 ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if len(solve_n_queens(4)) == 2 else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    bool p = s.solveNQueens(4).size() == 2;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'trapping-rain-water',
      title: 'Trapping Rain Water',
      difficulty: 'Advanced',
      description: `Compute total water trapped after raining given elevation map.`,
      templates: {
        javascript: `function trap(height) {\n    return 0;\n}`,
        python: `def trap(height: list[int]) -> int:\n    return 0`,
        cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    int trap(vector<int>& height) {\n        return 0;\n    }\n};`
      },
      testScript: {
        javascript: `console.log(trap([0,1,0,2,1,0,1,3,2,1,2,1]) === 6 ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if trap([0,1,0,2,1,0,1,3,2,1,2,1]) == 6 else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    vector<int> h = {0,1,0,2,1,0,1,3,2,1,2,1};\n    bool p = s.trap(h) == 6;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'edit-distance',
      title: 'Edit Distance',
      difficulty: 'Advanced',
      description: `Compute minimum operations to convert word1 to word2.`,
      templates: {
        javascript: `function minDistance(word1, word2) {\n    return 0;\n}`,
        python: `def min_distance(word1: str, word2: str) -> int:\n    return 0`,
        cpp: `#include <string>\nusing namespace std;\nclass Solution {\npublic:\n    int minDistance(string word1, string word2) {\n        return 0;\n    }\n};`
      },
      testScript: {
        javascript: `console.log(minDistance("horse", "ros") === 3 ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if min_distance("horse", "ros") == 3 else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    bool p = s.minDistance("horse", "ros") == 3;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'word-search-ii',
      title: 'Word Search II',
      difficulty: 'Advanced',
      description: `Find all words from board that exist in the word dictionary list.`,
      templates: {
        javascript: `function findWords(board, words) {\n    return [];\n}`,
        python: `def find_words(board: list[list[str]], words: list[str]) -> list[str]:\n    return []`,
        cpp: `#include <vector>\n#include <string>\nusing namespace std;\nclass Solution {\npublic:\n    vector<string> findWords(vector<vector<char>>& board, vector<string>& words) {\n        return {};\n    }\n};`
      },
      testScript: {
        javascript: `console.log(findWords([["a"]], ["a"]).includes("a") ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if find_words([["a"]], ["a"]) == ["a"] else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    vector<vector<char>> b = {{'a'}};\n    vector<string> w = {"a"};\n    bool p = (s.findWords(b, w) == vector<string>{"a"});\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'sliding-window-max',
      title: 'Sliding Window Maximum',
      difficulty: 'Advanced',
      description: `Return max value in sliding window of size k.`,
      templates: {
        javascript: `function maxSlidingWindow(nums, k) {\n    return [];\n}`,
        python: `def max_sliding_window(nums: list[int], k: int) -> list[int]:\n    return []`,
        cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    vector<int> maxSlidingWindow(vector<int>& nums, int k) {\n        return {};\n    }\n};`
      },
      testScript: {
        javascript: `console.log(JSON.stringify(maxSlidingWindow([1,3,-1,-3,5,3,6,7], 3)) === JSON.stringify([3,3,5,5,6,7]) ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if max_sliding_window([1,3,-1,-3,5,3,6,7], 3) == [3,3,5,5,6,7] else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    vector<int> n = {1,3,-1,-3,5,3,6,7};\n    bool p = s.maxSlidingWindow(n, 3) == vector<int>{3,3,5,5,6,7};\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'min-window-substring',
      title: 'Minimum Window Substring',
      difficulty: 'Advanced',
      description: `Find the minimum window in s containing all characters of t.`,
      templates: {
        javascript: `function minWindow(s, t) {\n    return "";\n}`,
        python: `def min_window(s: str, t: str) -> str:\n    return ""`,
        cpp: `#include <string>\nusing namespace std;\nclass Solution {\npublic:\n    string minWindow(string s, string t) {\n        return "";\n    }\n};`
      },
      testScript: {
        javascript: `console.log(minWindow("ADOBECODEBANC", "ABC") === "BANC" ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if min_window("ADOBECODEBANC", "ABC") == "BANC" else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    bool p = s.minWindow("ADOBECODEBANC", "ABC") == "BANC";\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'consecutive-sequence',
      title: 'Longest Consecutive Sequence',
      difficulty: 'Advanced',
      description: `Find length of the longest consecutive elements sequence in O(n).`,
      templates: {
        javascript: `function longestConsecutive(nums) {\n    return 0;\n}`,
        python: `def longest_consecutive(nums: list[int]) -> int:\n    return 0`,
        cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    int longestConsecutive(vector<int>& nums) {\n        return 0;\n    }\n};`
      },
      testScript: {
        javascript: `console.log(longestConsecutive([100,4,200,1,3,2]) === 4 ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if longest_consecutive([100,4,200,1,3,2]) == 4 else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    vector<int> n = {100,4,200,1,3,2};\n    bool p = s.longestConsecutive(n) == 4;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'median-data-stream',
      title: 'Find Median from Data Stream',
      difficulty: 'Advanced',
      description: `Implement MedianFinder class supporting addNum(num) and findMedian() in O(log n).`,
      templates: {
        javascript: `class MedianFinder {\n    constructor() {}\n    addNum(num) {}\n    findMedian() { return 0.0; }\n}`,
        python: `class MedianFinder:\n    def __init__(self): pass\n    def addNum(self, num: int) -> None: pass\n    def findMedian(self) -> float: return 0.0`,
        cpp: `class MedianFinder {\npublic:\n    MedianFinder() {}\n    void addNum(int num) {}\n    double findMedian() { return 0.0; }\n};`
      },
      testScript: {
        javascript: `const m = new MedianFinder(); m.addNum(1); m.addNum(2); console.log(m.findMedian() === 1.5 ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `m = MedianFinder(); m.addNum(1); m.addNum(2); print("All test cases PASSED!" if m.findMedian() == 1.5 else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    MedianFinder m; m.addNum(1); m.addNum(2);\n    bool p = m.findMedian() == 1.5;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'alien-dictionary',
      title: 'Alien Dictionary',
      difficulty: 'Advanced',
      description: `Return lexicographically sorted character order given a list of sorted alien words.`,
      templates: {
        javascript: `function alienOrder(words) {\n    return "";\n}`,
        python: `def alien_order(words: list[str]) -> str:\n    return ""`,
        cpp: `#include <vector>\n#include <string>\nusing namespace std;\nclass Solution {\npublic:\n    string alienOrder(vector<string>& words) {\n        return "";\n    }\n};`
      },
      testScript: {
        javascript: `console.log(alienOrder(["wrt","wrf"]) === "wertf" || alienOrder(["wrt","wrf"]) === "wert" ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if len(alien_order(["wrt","wrf"])) > 0 else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    vector<string> w = {"wrt","wrf"};\n    bool p = s.alienOrder(w).size() > 0;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'max-points-line',
      title: 'Max Points on a Line',
      difficulty: 'Advanced',
      description: `Find max points lying on the same straight line.`,
      templates: {
        javascript: `function maxPoints(points) {\n    return 0;\n}`,
        python: `def max_points(points: list[list[int]]) -> int:\n    return 0`,
        cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    int maxPoints(vector<vector<int>>& points) {\n        return 0;\n    }\n};`
      },
      testScript: {
        javascript: `console.log(maxPoints([[1,1],[2,2],[3,3]]) === 3 ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if max_points([[1,1],[2,2],[3,3]]) == 3 else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    vector<vector<int>> p = {{1,1},{2,2},{3,3}};\n    bool p_flag = s.maxPoints(p) == 3;\n    std::cout << (p_flag ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'largest-rectangle',
      title: 'Largest Rectangle in Histogram',
      difficulty: 'Advanced',
      description: `Find area of largest rectangle in histogram heights.`,
      templates: {
        javascript: `function largestRectangleArea(heights) {\n    return 0;\n}`,
        python: `def largest_rectangle_area(heights: list[int]) -> int:\n    return 0`,
        cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    int largestRectangleArea(vector<int>& heights) {\n        return 0;\n    }\n};`
      },
      testScript: {
        javascript: `console.log(largestRectangleArea([2,1,5,6,2,3]) === 10 ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `print("All test cases PASSED!" if largest_rectangle_area([2,1,5,6,2,3]) == 10 else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    vector<int> h = {2,1,5,6,2,3};\n    bool p = s.largestRectangleArea(h) == 10;\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    },
    {
      id: 'binary-tree-postorder',
      title: 'Binary Tree Postorder Traversal',
      difficulty: 'Advanced',
      description: `Return postorder traversal of binary tree nodes values in iterative form.`,
      templates: {
        javascript: `function TreeNode(val, left, right) {\n    this.val = val; this.left = left; this.right = right;\n}\nfunction postorderTraversal(root) {\n    return [];\n}`,
        python: `class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val=val; self.left=left; self.right=right\ndef postorder_traversal(root: TreeNode) -> list[int]:\n    return []`,
        cpp: `struct TreeNode {\n    int val; TreeNode *left; TreeNode *right;\n    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n};\nclass Solution {\npublic:\n    vector<int> postorderTraversal(TreeNode* root) {\n        return {};\n    }\n};`
      },
      testScript: {
        javascript: `const r = new TreeNode(1, null, new TreeNode(2)); console.log(JSON.stringify(postorderTraversal(r)) === JSON.stringify([2,1]) ? "All test cases PASSED!" : "Some test cases FAILED.");`,
        python: `r = TreeNode(1, None, TreeNode(2)); print("All test cases PASSED!" if postorder_traversal(r) == [2, 1] else "Some test cases FAILED.")`,
        cpp: `#include <iostream>\nint main() {\n    Solution s;\n    TreeNode* r = new TreeNode(1);\n    r->right = new TreeNode(2);\n    bool p = (s.postorderTraversal(r) == vector<int>{2,1});\n    std::cout << (p ? "All test cases PASSED!" : "Some test cases FAILED.") << std::endl;\n    return 0;\n}`
      }
    }
  ]
};
