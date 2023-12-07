def is_hex_address(s):
    if has_0x_prefix(s):
        s = s[2:]
    return len(s) == 2 * 20 and is_hex(s)


def is_hex(str):
    if len(str) % 2 != 0:
        return False
    for c in str:
        if not is_hex_character(c):
            return False
    return True


def is_hex_character(c):
    return ('0' <= c <= '9') or ('a' <= c <= 'f') or ('A' <= c <= 'F')


def has_0x_prefix(str):
    return len(str) >= 2 and str[0] == '0' and (str[1] == 'x' or str[1] == 'X')
