import re


def generate_internal_part_code(
    manufacturer: str, system: str, part_type: str, sequence: int
) -> str:
    """
    Generates an internal part code using manufacturer, system, part type, and a sequential number.
    Format: MFG-SYS-TYPE-SEQ
    All components are normalised to upper case and non-alphanumeric characters are removed.
    """

    def normalise(text: str) -> str:
        return re.sub(r"[^A-Z0-0]", "", text.upper())

    mfg = normalise(manufacturer)[:3]
    sys = normalise(system)[:3]
    typ = normalise(part_type)[:3]

    return f"{mfg}-{sys}-{typ}-{sequence:05d}"
