import axios from 'axios'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
	const searchParams = req.nextUrl.searchParams
	const name = searchParams.get('name')
	const phone_number = searchParams.get('phone_number')
	const email = searchParams.get('email')
	const direction = searchParams.get('direction')
    const from = searchParams.get('from')
    const locale = searchParams.get('locale')
	const path = searchParams.get('path')
	const data = [
		{
			name: name,
			_embedded: {
				contacts: [
					{
						name: name,
						custom_fields_values: [
							{
								field_id: 979514,
								values: [
									{
										value: phone_number,
									},
								],
							},
							{
								field_id: 979516,
								values: [
									{
										value: email,
									},
								],
							},
							{
								field_id: 1077072,
								values: [
									{
										value: direction,
									},
								],
							},
							{
								field_id: 1077074,
								values: [
									{
										value: path,
									},
								],
							},
							{
								field_id: 1076512,
								values: [
									{
										value: locale,
									},
								],
							},
							{
								field_id: 1077076,
								values: [
									{
										value: from,
									},
								],
							},
                            {
                                field_id: 1077074,
                                values: [
                                    {
                                        value: path,
                                    },
                                ],
                            }
						],
					},
				],
			},
		},
	]

	// try {
	//     const response = await fetch('https://businessjet.kommo.com/api/v4/leads/complex', {
	//         method: 'POST',
	//         headers: {
	//             'Content-Type': 'application/json',
	//             Authorization: `Bearer ${process.env.CRM_AUTH}`,
	//         },
	//         body: req.body,
	//     })

	//     if (!response.ok) {
	//         return NextResponse.json(response)
	//     }

	//     const responseData = await response.json()
	//     return NextResponse.json(responseData)

	// } catch (error) {
	//     console.error(error)
	//     return NextResponse.json({ error: 'An error occurred while trying to post data to the CRM' }, { status: 500 })
	// }

	try {
		const response = await axios.post('https://businessjet.kommo.com/api/v4/leads/complex', data, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${process.env.CRM_AUTH}`,
				'Access-Control-Allow-Origin': '*',
			},
		})
		return NextResponse.json(response)
	} catch (error) {
		console.error(error)
		return NextResponse.json(error)
	}
}
