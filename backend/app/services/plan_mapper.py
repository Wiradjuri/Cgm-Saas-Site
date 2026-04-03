PLAN_LICENSES = {
    "SUB-STR-26": 1,
    "SUB-PRO-26": 3,
    "SUB-BIZ-26": 8,
    "SUB-GRW-26": 20,
    "SUB-ENT-26": 999999,
}


def get_plan(sku: str) -> int:
    normalized_sku = (sku or "").strip().upper()

    if normalized_sku not in PLAN_LICENSES:
        raise ValueError(f"Invalid SKU: {sku}")

    return PLAN_LICENSES[normalized_sku]
