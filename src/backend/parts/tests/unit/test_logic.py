from parts.core.logic import generate_internal_part_code


def test_generate_internal_part_code():
    code = generate_internal_part_code("Toyota", "Powertrain", "Engine", 1)
    assert code == "TOY-POW-ENG-00001"


def test_generate_internal_part_code_normalisation():
    code = generate_internal_part_code("Land Rover", "Suspension & Steering", "Bushing!", 123)
    # Norm: LANDROVER -> LAN, SUSPENSIONSTEERING -> SUS, BUSHING -> BUS
    assert code == "LAN-SUS-BUS-00123"
