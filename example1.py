# This code has O(n^2) time complexity

def sum_of_squares(n):
    # Using mathematical formula: sum(i*j) for i,j in range(n)
    # This is equal to (n-1)*n/2 * (n-1)*n/2
    # Time complexity: O(1)
    return ((n-1) * n // 2) * ((n-1) * n // 2)

print(sum_of_squares(10))

'''
    expected output: 90
'''

def merge_lists(list1, list2):
    # Merge two sorted lists into a single sorted list
    # Time complexity: O(n)
    return sorted(list1 + list2)

print(merge_lists([1, 3, 5], [2, 4, 6]))

'''
    expected output: [1, 2, 3, 4, 5, 6]
'''
